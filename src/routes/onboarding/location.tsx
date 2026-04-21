import { ScoutButton, ScoutCallout } from "@scouterna/ui-react";
import { createFileRoute } from "@tanstack/react-router";
import { T, useTranslate } from "@tolgee/react";
import { useEffect, useState } from "react";
import { ScoutButtonLink } from "../../components/links";
import { OnboardingFooter } from "../../components/onboarding/OnboardingFooter";

export const Route = createFileRoute("/onboarding/location")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslate();

  const [status, setStatus] = useState<"prompt" | "denied" | "granted">(
    "prompt",
  );

  useEffect(() => {
    navigator.permissions
      .query({
        name: "geolocation",
      })
      .then((permissionStatus) => {
        setStatus(permissionStatus.state as "prompt" | "denied" | "granted");
      });
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;

    navigator.geolocation.getCurrentPosition(
      () => {
        console.log("A");
        setStatus("granted");
      },
      () => {
        console.log("B");
        setStatus("denied");
      },
    );
  };

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
            status === "granted" ? (
              <ScoutCallout
                variant="success"
                heading={t("onboarding.location.granted.heading")}
              >
                <T keyName="onboarding.location.granted.description" />
              </ScoutCallout>
            ) : (
              <ScoutCallout
                variant="error"
                heading={t("onboarding.location.denied.heading")}
              >
                <T keyName="onboarding.location.denied.description" />
              </ScoutCallout>
            )
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
