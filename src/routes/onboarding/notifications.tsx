import { ScoutButton, ScoutCallout } from "@scouterna/ui-react";
import { createFileRoute } from "@tanstack/react-router";
import { T, useTranslate } from "@tolgee/react";
import { useState } from "react";
import { ScoutButtonLink } from "../../components/links";
import { OnboardingFooter } from "../../components/onboarding/OnboardingFooter";

export const Route = createFileRoute("/onboarding/notifications")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslate();

  const [status, setStatus] = useState(
    "Notification" in window ? Notification.permission : "denied",
  );

  const requestPermission = async () => {
    if (!("Notification" in window)) return;

    const permission = await Notification.requestPermission();
    setStatus(permission);
  };

  return (
    <>
      <div className="flex-1 px-4">
        <h1 className="text-heading-base">
          <T keyName="onboarding.notifications.title" />
        </h1>

        <p className="text-body-base">
          <T keyName="onboarding.notifications.description" />
        </p>

        <div className="flex flex-col items-center gap-4 mt-8">
          {status !== "default" ? (
            status === "granted" ? (
              <ScoutCallout
                variant="success"
                heading={t("onboarding.notifications.granted.heading")}
              >
                <T keyName="onboarding.notifications.granted.description" />
              </ScoutCallout>
            ) : (
              <ScoutCallout
                variant="error"
                heading={t("onboarding.notifications.denied.heading")}
              >
                <T keyName="onboarding.notifications.denied.description" />
              </ScoutCallout>
            )
          ) : (
            <>
              <ScoutButton
                size="large"
                variant="primary"
                onScoutClick={requestPermission}
              >
                <T keyName="onboarding.notifications.acceptButton.label" />
              </ScoutButton>

              <ScoutButtonLink
                variant="text"
                to="/onboarding/location"
                viewTransition={{ types: ["slide-left"] }}
              >
                <T keyName="onboarding.notifications.declineButton.label" />
              </ScoutButtonLink>
            </>
          )}
        </div>
      </div>

      <OnboardingFooter back="/onboarding/signin" next="/onboarding/location" />
    </>
  );
}
