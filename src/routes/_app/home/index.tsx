import {
  ScoutTabbedView,
  ScoutTabbedViewPanel,
  ScoutTabs,
  ScoutTabsTab,
} from "@scouterna/ui-react";
import SettingsIcon from "@tabler/icons/outline/settings.svg?raw";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslate } from "@tolgee/react";
import { useId, useState } from "react";
import { PageContainer } from "../../../components/PageContainer";
import { Information } from "./tab-views/-information";
import { Notifications } from "./tab-views/-notifications";

export const Route = createFileRoute("/_app/home/")({
  component: RouteComponent,
  staticData: {
    pageName: "page.info.title",
    appBarAction: {
      icon: SettingsIcon,
      label: "appBar.notifications.settings.label",
      to: "/settings/notifications",
    },
  },
});

function RouteComponent() {
  const { t } = useTranslate("app");
  const tabsId = useId();

  const [activeTab, setActiveTab] = useState(0);
  const [swipeValue, setSwipeValue] = useState<number | undefined>(undefined);

  const handleTabChange = (value: number) => {
    setActiveTab(value);
    setSwipeValue(undefined);
  };

  return (
    <PageContainer scrollable={false} className="flex flex-col">
      <div className="p-2">
        <ScoutTabs
          id={tabsId}
          value={activeTab}
          swipeValue={swipeValue}
          onScoutChange={(e) => handleTabChange(e.detail.value)}
        >
          <ScoutTabsTab>{t("page.info.tabs.notifications.title")}</ScoutTabsTab>
          <ScoutTabsTab>{t("page.info.tabs.information.title")}</ScoutTabsTab>
        </ScoutTabs>
      </div>
      <ScoutTabbedView
        value={activeTab}
        onScoutChange={(e) => handleTabChange(e.detail.value)}
        onScoutSwipeProgress={(e) => setSwipeValue(e.detail.swipeValue)}
        tabsId={tabsId}
        className="flex-1"
      >
        <ScoutTabbedViewPanel>
          <Notifications />
        </ScoutTabbedViewPanel>
        <ScoutTabbedViewPanel>
          <Information />
        </ScoutTabbedViewPanel>
      </ScoutTabbedView>
    </PageContainer>
  );
}
