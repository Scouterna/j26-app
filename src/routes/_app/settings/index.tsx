import { ScoutListView, ScoutListViewItem } from "@scouterna/ui-react";
import BellIcon from "@tabler/icons/outline/bell.svg?raw";
import LanguageIcon from "@tabler/icons/outline/language.svg?raw";
import RefreshIcon from "@tabler/icons/outline/refresh.svg?raw";
import { createFileRoute, useRouter } from "@tanstack/react-router";
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
  const { t } = useTranslate("app");
  const router = useRouter();

  const redoOnboarding = () => {
    router.navigate({
      to: "/onboarding",
    });
  };

  return (
    <ScoutListView>
      <LanguageItem />
      <ScoutListViewItemLink
        primary="Notisinställningar"
        icon={BellIcon}
        to="/settings/notifications"
      />
      <ScoutListViewItem
        primary={t("page.settings.redoOnboarding.label")}
        icon={RefreshIcon}
        onScoutClick={redoOnboarding}
      />
    </ScoutListView>
  );
}
