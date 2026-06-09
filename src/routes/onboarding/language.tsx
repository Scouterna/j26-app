import { createFileRoute } from "@tanstack/react-router";
import { T, useTolgee } from "@tolgee/react";
import { useEffect, useState } from "react";
import { LanguageSelector } from "../../components/LanguageSelector";
import { OnboardingFooter } from "../../components/onboarding/OnboardingFooter";

export const Route = createFileRoute("/onboarding/language")({
  component: RouteComponent,
});

function RouteComponent() {
  const tolgee = useTolgee();
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const listener = tolgee.on("fetching", (e) => {
      if (e.value) {
        timer = setTimeout(() => setIsFetching(true), 100);
      } else {
        clearTimeout(timer);
        setIsFetching(false);
      }
    });

    return () => {
      clearTimeout(timer);
      listener.unsubscribe();
    };
  }, [tolgee]);

  return (
    <>
      <div className="px-4">
        <h1 className="text-heading-base">
          <T keyName="onboarding.language.title" />
        </h1>

        <p className="text-body-base whitespace-pre-wrap">
          <T keyName="onboarding.language.description" />
        </p>
      </div>

      <div className="flex-1">
        <LanguageSelector />
      </div>

      <OnboardingFooter next="/onboarding/signin" nextLoading={isFetching} />
    </>
  );
}
