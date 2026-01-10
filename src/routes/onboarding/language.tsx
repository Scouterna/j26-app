import { createFileRoute } from "@tanstack/react-router";
import { T } from "@tolgee/react";
import { LanguageSelector } from "../../components/LanguageSelector";
import { OnboardingFooter } from "../../components/onboarding/OnboardingFooter";

export const Route = createFileRoute("/onboarding/language")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="px-4">
        <h1 className="text-heading-base">
          <T keyName="onboarding.language.title" />
        </h1>

        <p className="text-body-base">
          <T keyName="onboarding.language.description" />
        </p>
      </div>

      <div className="flex-1">
        <LanguageSelector />
      </div>

      <OnboardingFooter next="/onboarding/signin" />
    </>
  );
}
