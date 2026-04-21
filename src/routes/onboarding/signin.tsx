import { ScoutButton, ScoutCallout } from "@scouterna/ui-react";
import { createFileRoute } from "@tanstack/react-router";
import { T, useTranslate } from "@tolgee/react";
import { useAuthUrls } from "../../auth/auth";
import { OnboardingFooter } from "../../components/onboarding/OnboardingFooter";

export const Route = createFileRoute("/onboarding/signin")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslate();
  const user = { name: "Malcolm Nihlén" };

  const { loginUrl } = useAuthUrls({
    redirectUri: "/onboarding/signin",
  });

  return (
    <>
      <div className="px-4 flex-1 flex flex-col">
        <h1 className="text-heading-base">
          <T keyName="onboarding.signin.title" />
        </h1>

        <p className="text-body-base">
          <T keyName="onboarding.signin.description" />
        </p>

        <div className="flex justify-center mt-8">
          {user ? (
            <ScoutCallout
              variant="success"
              heading={t("onboarding.signin.signedIn.heading")}
            >
              <T
                keyName="onboarding.signin.signedIn.description"
                params={{ name: user.name }}
              />
            </ScoutCallout>
          ) : (
            <ScoutButton
              type="link"
              size="large"
              variant="primary"
              href={loginUrl}
            >
              <T keyName="onboarding.signin.button.label" />
            </ScoutButton>
          )}
        </div>
      </div>

      <OnboardingFooter
        back="/onboarding/language"
        next="/onboarding/notifications"
        nextSuppressed={!user}
      />
    </>
  );
}
