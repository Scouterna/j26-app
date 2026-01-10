import { ScoutListView } from "@scouterna/ui-react";
import BellIcon from "@tabler/icons/outline/bell.svg?raw";
import LanguageIcon from "@tabler/icons/outline/language.svg?raw";
import { createFileRoute } from "@tanstack/react-router";
import { useTolgee, useTranslate } from "@tolgee/react";
import { use } from "react";
import { ScoutListViewItemLink } from "../../../components/links";
import { languageNamesPromise } from "../../../tolgee";

export const Route = createFileRoute("/_app/settings/")({
  component: RouteComponent,
  staticData: {
    pageName: "page.settings.title",
  },
});

function LanguageItem() {
  const { t } = useTranslate("app");
  const tolgee = useTolgee();
  const language = tolgee.getLanguage();
  const languageNames = use(languageNamesPromise);

  return (
    <ScoutListViewItemLink
      primary={t("language_selector.title")}
      secondary={language ? languageNames[language] : undefined}
      icon={LanguageIcon}
      to="/settings/language"
    />
  );
}

function RouteComponent() {
  return (
    <ScoutListView>
      <LanguageItem />
      <ScoutListViewItemLink
        primary="Notisinställningar"
        to="/settings/notifications"
        icon={BellIcon}
      />
    </ScoutListView>
  );
}
