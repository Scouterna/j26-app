import { ScoutButton, ScoutCallout } from "@scouterna/ui-react";
import { createFileRoute } from "@tanstack/react-router";
import { T, useTranslate } from "@tolgee/react";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { useAuthUrls, userAtom } from "../../auth/auth";
import { OnboardingFooter } from "../../components/onboarding/OnboardingFooter";
import { registerForPushNotifications } from "../../notifications/firebase";

export const Route = createFileRoute("/onboarding/notifications")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslate();

  const user = useAtomValue(userAtom);
  const { loginUrl } = useAuthUrls({
    redirectUri: "/onboarding/notifications",
  });

  const [status, setStatus] = useState<NotificationPermission | "error">(
    "Notification" in window ? Notification.permission : "denied",
  );
  const [loading, setLoading] = useState(false);

  const nextSuppressed = status === "default" || !user;

  const requestPermission = async () => {
    if (!("Notification" in window)) return;

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission);
        return;
      }

      await registerForPushNotifications();
      setStatus("granted");
    } catch (e) {
      console.error("Failed to register for push notifications:", e);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex-1 px-4">
        <h1 className="text-heading-base">
          <T keyName="onboarding.notifications.title" />
        </h1>

        <p className="text-body-base whitespace-pre-wrap">
          <T keyName="onboarding.notifications.description" />
        </p>

        <div className="flex flex-col items-center gap-4 mt-8">
          {!user ? (
            <ScoutCallout variant="warning">
              <T keyName="onboarding.notifications.signInRequired" />

              <div className="flex">
                <ScoutButton
                  type="link"
                  variant="primary"
                  href={loginUrl}
                  className="mt-2 w-full"
                >
                  <T keyName="onboarding.signin.button.label" />
                </ScoutButton>
              </div>
            </ScoutCallout>
          ) : status === "granted" ? (
            <ScoutCallout
              variant="success"
              heading={t("onboarding.notifications.granted.heading")}
            >
              <T keyName="onboarding.notifications.granted.description" />
            </ScoutCallout>
          ) : status === "denied" ? (
            <ScoutCallout
              variant="error"
              heading={t("onboarding.notifications.denied.heading")}
            >
              <T keyName="onboarding.notifications.denied.description" />
            </ScoutCallout>
          ) : status === "error" ? (
            <ScoutCallout
              variant="error"
              heading={t("onboarding.notifications.error.heading")}
            >
              <T keyName="onboarding.notifications.error.description" />
            </ScoutCallout>
          ) : (
            <>
              <ScoutButton
                size="large"
                variant="primary"
                loading={loading}
                onScoutClick={requestPermission}
              >
                <T keyName="onboarding.notifications.acceptButton.label" />
              </ScoutButton>

              {/* <ScoutButtonLink
                variant="text"
                to="/onboarding/location"
                viewTransition={{ types: ["slide-left"] }}
              >
                <T keyName="onboarding.notifications.declineButton.label" />
              </ScoutButtonLink> */}
            </>
          )}
        </div>
      </div>

      <OnboardingFooter
        back="/onboarding/signin"
        next="/onboarding/location"
        nextSuppressed={nextSuppressed}
        nextLoading={loading}
      />
    </>
  );
}
