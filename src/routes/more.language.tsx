import { ScoutListView, ScoutListViewItem } from "@scouterna/ui-react";
import { createFileRoute } from "@tanstack/react-router";
import { useTolgee } from "@tolgee/react";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { languageAtom } from "../language/language";
import { languageNames } from "../tolgee";

export const Route = createFileRoute("/more/language")({
  component: RouteComponent,
  staticData: {
    pageName: "page.language.title",
  },
});

function RouteComponent() {
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
    // <div className="p-4">
    //   <ScoutStack direction="column" gapSize="xs">
    //     {availableLanguages.map((language) => (
    //       <ScoutButton
    //         key={language}
    //         variant={language === currentLanguage ? "primary" : "outlined"}
    //         onScoutClick={() => {
    //           tolgee.changeLanguage(language);
    //         }}
    //       >
    //         {t(`language.${language}`, { language })}
    //       </ScoutButton>
    //     ))}
    //   </ScoutStack>
    // </div>

    <ScoutListView>
      {availableLanguages.map((language) => (
        <ScoutListViewItem
          key={language}
          primary={languageNames[language] || language}
          onScoutClick={() => {
            tolgee.changeLanguage(language);
          }}
          // selected={language === currentLanguage}
        />
      ))}
    </ScoutListView>
  )
}
