import { ScoutButton, ScoutCard } from "@scouterna/ui-react";
import { createFileRoute } from "@tanstack/react-router";
import { T } from "@tolgee/react";
import { useCallback, useEffect, useState } from "react";
import { ScoutButtonLink } from "../../components/links";
import { OnboardingFooter } from "../../components/onboarding/OnboardingFooter";

export const Route = createFileRoute("/onboarding/location")({
  component: RouteComponent,
});

const geolocationPermissionPromise = navigator.permissions.query({
  name: "geolocation",
});

function RouteComponent() {
  const [status, setStatus] = useState<"prompt" | "denied" | "granted">(
    "prompt",
  );

  useEffect(() => {
    geolocationPermissionPromise.then((permissionStatus) => {
      setStatus(permissionStatus.state as "prompt" | "denied" | "granted");
    });
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return;

    navigator.geolocation.getCurrentPosition(
      () => {
        setStatus("granted");
      },
      () => {
        setStatus("denied");
      },
    );
  }, []);

  return (
    <>
      <div className="flex-1 px-4">
        <h1 className="text-heading-base">
          <T keyName="onboarding.location.title" />
        </h1>

        <p className="text-body-base">
          <T keyName="onboarding.location.description" />
        </p>

        <div className="flex flex-col items-center gap-4 mt-8">
          {status !== "prompt" ? (
            <ScoutCard className="text-body-lg">
              <div className="px-4 py-2">
                {status === "granted" ? (
                  <T keyName="onboarding.location.granted" />
                ) : (
                  <T keyName="onboarding.location.denied" />
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
                <T keyName="onboarding.location.acceptButton.label" />
              </ScoutButton>

              <ScoutButtonLink
                variant="text"
                to="/onboarding/finished"
                viewTransition={{ types: ["slide-left"] }}
              >
                <T keyName="onboarding.location.declineButton.label" />
              </ScoutButtonLink>
            </>
          )}
        </div>
      </div>

      <OnboardingFooter
        back="/onboarding/notifications"
        next="/onboarding/finished"
        nextSuppressed={status === "prompt"}
      />
    </>
  );
}
