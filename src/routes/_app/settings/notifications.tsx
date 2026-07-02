import { ScoutButton, ScoutCallout, ScoutLoader } from "@scouterna/ui-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { T, useTranslate } from "@tolgee/react";
import { useState } from "react";
import { PageContainer } from "../../../components/PageContainer";
import {
  getFirebaseToken,
  registerForPushNotifications,
  requestAndRegisterForPushNotifications,
} from "../../../notifications/firebase";

export const Route = createFileRoute("/_app/settings/notifications")({
  component: RouteComponent,
  staticData: {
    pageName: "page.settings.notifications.label",
  },
});

// TODO: this page's checks (Push API subscription, Firebase getToken) assume
// the Web Push flow and will misreport status on the iOS wrapper app, which
// registers via the native push-token bridge instead (see notifications/ios-bridge.ts).

type CheckStatus = "ok" | "warning" | "error" | "skipped";

interface CheckResult {
  status: CheckStatus;
  headingKey: string;
  messageKey?: string;
  messageParams?: Record<string, string>;
}

const VARIANT: Record<CheckStatus, "success" | "warning" | "error" | "info"> = {
  ok: "success",
  warning: "warning",
  error: "error",
  skipped: "info",
};

async function checkPermission(): Promise<CheckResult> {
  const headingKey = "settings.notifications.status.permission.heading";
  if (!("Notification" in window))
    return {
      status: "skipped",
      headingKey,
      messageKey: "settings.notifications.status.permission.unsupported",
    };
  if (Notification.permission === "granted")
    return {
      status: "ok",
      headingKey,
      messageKey: "settings.notifications.status.permission.ok",
    };
  if (Notification.permission === "denied")
    return {
      status: "error",
      headingKey,
      messageKey: "settings.notifications.status.permission.denied",
    };
  return {
    status: "warning",
    headingKey,
    messageKey: "settings.notifications.status.permission.default",
  };
}

async function checkSubscription(): Promise<CheckResult> {
  const headingKey = "settings.notifications.status.subscription.heading";
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub)
      return {
        status: "ok",
        headingKey,
        messageKey: "settings.notifications.status.subscription.ok",
      };
    return {
      status: "warning",
      headingKey,
      messageKey: "settings.notifications.status.subscription.warning",
    };
  } catch (e) {
    return {
      status: "error",
      headingKey,
      messageKey: "settings.notifications.status.subscription.error",
      messageParams: { error: String(e) },
    };
  }
}

async function checkFirebase(): Promise<CheckResult> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const headingKey = "settings.notifications.status.server.heading";
  try {
    await getFirebaseToken();
    return {
      status: "ok",
      headingKey,
      messageKey: "settings.notifications.status.server.ok",
    };
  } catch (e) {
    return {
      status: "error",
      headingKey,
      messageKey: "settings.notifications.status.server.error",
      messageParams: { error: String(e) },
    };
  }
}

const SKIPPED: Pick<CheckResult, "status"> = {
  status: "skipped",
};

async function runStatusChecks(): Promise<CheckResult[]> {
  const permission = await checkPermission();
  if (permission.status !== "ok")
    return [
      permission,
      {
        ...SKIPPED,
        headingKey: "settings.notifications.status.subscription.heading",
      },
      {
        ...SKIPPED,
        headingKey: "settings.notifications.status.server.heading",
      },
    ];

  const subscription = await checkSubscription();
  if (subscription.status !== "ok")
    return [
      permission,
      subscription,
      {
        ...SKIPPED,
        headingKey: "settings.notifications.status.server.heading",
      },
    ];

  const firebase = await checkFirebase();
  return [permission, subscription, firebase];
}

const STATUS_QUERY_KEY = ["notifications", "status"];

function NotificationStatus() {
  const { t } = useTranslate();
  const [registering, setRegistering] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(
    "Notification" in window ? Notification.permission : "denied",
  );
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useQuery({
    queryKey: STATUS_QUERY_KEY,
    queryFn: runStatusChecks,
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <ScoutLoader text={t("settings.notifications.status.checking")} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {data
        ?.filter((r) => r.status !== "skipped")
        .map((result) => (
          <ScoutCallout
            key={result.headingKey}
            variant={VARIANT[result.status]}
            heading={t(result.headingKey)}
          >
            {result.messageKey && t(result.messageKey, result.messageParams)}
          </ScoutCallout>
        ))}
      {/* Keys force full remount when switching — Stencil web components hide
          their slot content when React updates children in-place. */}
      {permission === "default" ? (
        <ScoutButton
          key="allow"
          variant="primary"
          loading={registering}
          onScoutClick={async () => {
            setRegistering(true);
            await requestAndRegisterForPushNotifications();
            await refetch();
            setPermission(Notification.permission);
            setRegistering(false);
          }}
        >
          <T keyName="settings.notifications.allow" />
        </ScoutButton>
      ) : permission === "granted" ? (
        <>
          <p className="text-body-sm">
            <T keyName="settings.notifications.reregister.description" />
          </p>
          <ScoutButton
            key="reregister"
            variant="outlined"
            onScoutClick={async () => {
              queryClient.resetQueries({ queryKey: STATUS_QUERY_KEY });
              await registerForPushNotifications().catch((e) =>
                console.error(
                  "Failed to re-register for push notifications:",
                  e,
                ),
              );
              await refetch();
            }}
          >
            <T keyName="settings.notifications.reregister" />
          </ScoutButton>
        </>
      ) : null}
    </div>
  );
}

function RouteComponent() {
  return (
    <PageContainer>
      <NotificationStatus />
    </PageContainer>
  );
}
