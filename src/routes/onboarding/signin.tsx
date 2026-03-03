import { ScoutButton, ScoutCard } from "@scouterna/ui-react";
import { createFileRoute } from "@tanstack/react-router";
import { T } from "@tolgee/react";
import { useAtomValue } from "jotai";
import { useAuthUrls, userAtom } from "../../auth/auth";
import { OnboardingFooter } from "../../components/onboarding/OnboardingFooter";

export const Route = createFileRoute("/onboarding/signin")({
  component: RouteComponent,
});

function RouteComponent() {
  const user = useAtomValue(userAtom);

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
