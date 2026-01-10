import { ScoutButton, ScoutCard } from "@scouterna/ui-react";
import { createFileRoute } from "@tanstack/react-router";
import { T } from "@tolgee/react";
import { useCallback, useState } from "react";
import { ScoutButtonLink } from "../../components/links";
import { OnboardingFooter } from "../../components/onboarding/OnboardingFooter";

export const Route = createFileRoute("/onboarding/notifications")({
  component: RouteComponent,
});

function RouteComponent() {
  const [status, setStatus] = useState(
    "Notification" in window ? Notification.permission : "denied",
  );

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return;

    const permission = await Notification.requestPermission();
    setStatus(permission);
  }, []);

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
            <ScoutCard className="text-body-lg">
              <div className="px-4 py-2">
                {status === "granted" ? (
                  <T keyName="onboarding.notifications.granted" />
                ) : (
                  <T keyName="onboarding.notifications.denied" />
                )}
              </div>
            </ScoutCard>
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
                to="/onboarding/language"
                viewTransition={{ types: ["slide-left"] }}
              >
                <T keyName="onboarding.notifications.declineButton.label" />
              </ScoutButtonLink>
            </>
          )}
        </div>
      </div>

      <OnboardingFooter
        back="/onboarding/signin"
        next="/onboarding/finished"
        nextSuppressed={status === "default"}
      />
    </>
  );
}
