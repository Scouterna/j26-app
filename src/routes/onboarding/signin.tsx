import { createFileRoute } from "@tanstack/react-router";
import { T } from "@tolgee/react";
import { OnboardingFooter } from "../../components/onboarding/OnboardingFooter";
import { OnboardingLayout } from "../../components/onboarding/OnboardingLayout";
import { ScoutButton, ScoutCard } from "@scouterna/ui-react";
import { useAtomValue } from "jotai";
import { userAtom } from "../../auth/auth";

export const Route = createFileRoute("/onboarding/signin")({
  component: RouteComponent,
});

function RouteComponent() {
  const user = useAtomValue(userAtom);

  return (
    <OnboardingLayout>
      <div className="p-4 flex-1 flex flex-col">
        <h1 className="text-heading-base">
          <T keyName="onboarding.signin.title" />
        </h1>

        <p className="text-body-base">
          <T keyName="onboarding.signin.description" />
        </p>

        <div className="flex justify-center mt-8">
          {user ? (
            <ScoutCard className="text-body-lg">
              <div className="px-4 py-2">
                <T
                  keyName="onboarding.signin.signedIn"
                  params={{ name: user.name }}
                />
              </div>
            </ScoutCard>
          ) : (
            <ScoutButton
              type="link"
              size="large"
              variant="primary"
              href="https://app.dev.j26.se/auth/login?redirect_uri=https://app.dev.j26.se/onboarding/signin&silent=false"
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
    </OnboardingLayout>
  );
}
