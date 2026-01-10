import { ScoutListView, ScoutListViewItem } from "@scouterna/ui-react";
import { useTolgee } from "@tolgee/react";
import { useAtomValue } from "jotai";
import { use, useMemo } from "react";
import { languageAtom } from "../language/language";
import { languageNamesPromise } from "../tolgee";

const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function LanguageSelector() {
  const tolgee = useTolgee();

  const currentLanguage = useAtomValue(languageAtom);
  const languageNames = use(languageNamesPromise);

  const { availableLanguages } = useMemo(
    () => tolgee.getInitialOptions(),
    [tolgee.getInitialOptions],
  );

  if (!availableLanguages) {
    return <div>No available languages</div>;
  }

  return (
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
  );
}
