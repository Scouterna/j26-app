import { createFileRoute } from "@tanstack/react-router";
import { T } from "@tolgee/react";
import { OnboardingFooter } from "../../components/onboarding/OnboardingFooter";
import { useSetAtom } from "jotai";
import { onboardedAtom } from "../../onboarding";

export const Route = createFileRoute("/onboarding/finished")({
  component: RouteComponent,
});

function RouteComponent() {
  const setOnboarded = useSetAtom(onboardedAtom);

  return (
    <>
      <div className="px-4 flex-1 flex flex-col">
        <h1 className="text-heading-base">
          <T keyName="onboarding.finished.title" />
        </h1>

        <p className="text-body-base">
          <T keyName="onboarding.finished.description" />
        </p>
      </div>

      <OnboardingFooter
        back="/onboarding/location"
        next="/"
        lastPage
        onNextClick={() => setOnboarded(true)}
      />
    </>
  );
}
