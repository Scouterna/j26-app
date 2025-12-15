import { ScoutButton, ScoutStack } from "@scouterna/ui-react";
import { createFileRoute } from "@tanstack/react-router";
import { useTolgee, useTranslate } from "@tolgee/react";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { languageAtom } from "../language/language";

export const Route = createFileRoute("/language")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslate("app");
  const tolgee = useTolgee();

  const currentLanguage = useAtomValue(languageAtom);

  const { availableLanguages } = useMemo(
    () => tolgee.getInitialOptions(),
    [tolgee.getInitialOptions],
  );

  if (!availableLanguages) {
    return <div>No available languages</div>;
  }

  return (
    <div className="p-4">
      <ScoutStack direction="column" gapSize="xs">
        {availableLanguages.map((language) => (
          <ScoutButton
            key={language}
            variant={language === currentLanguage ? "primary" : "outlined"}
            onScoutClick={() => {
              tolgee.changeLanguage(language);
            }}
          >
            {t(`language.${language}`, { language })}
          </ScoutButton>
        ))}
      </ScoutStack>
    </div>
  );
}
