import {
  ScoutCallout,
  ScoutListView,
  ScoutListViewItem,
} from "@scouterna/ui-react";
import { useTolgee, useTranslate } from "@tolgee/react";
import { useAtomValue } from "jotai";
import { use } from "react";
import { languageAtom } from "../language/language";
import { languageNamesPromise } from "../tolgee";
import { upperFirst } from "../utils";

export function LanguageSelector() {
  const tolgee = useTolgee();
  const { t } = useTranslate("app");

  const currentLanguage = useAtomValue(languageAtom);
  const languageNames = use(languageNamesPromise);

  const { availableLanguages } = tolgee.getInitialOptions();

  if (!availableLanguages) {
    return <div>No available languages</div>;
  }

  const showNonStandardLanguageWarning =
    !currentLanguage || !["sv", "en"].includes(currentLanguage);

  return (
    <>
      <ScoutListView>
        {availableLanguages.map((language) => (
          <ScoutListViewItem
            key={language}
            type="radio"
            name="language"
            value={language}
            checked={language === currentLanguage}
            primary={upperFirst(languageNames[language] || language)}
            onScoutClick={() => {
              tolgee.changeLanguage(language);
            }}
          />
        ))}
      </ScoutListView>

      {showNonStandardLanguageWarning && (
        <div className="px-4">
          <ScoutCallout
            heading={t("languageSelector.nonStandardLanguageWarning.heading")}
            variant="warning"
          >
            {t("languageSelector.nonStandardLanguageWarning.description")}
          </ScoutCallout>
        </div>
      )}
    </>
  );
}
