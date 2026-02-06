import { ScoutTabs, ScoutTabsTab } from "@scouterna/ui-react";
import {
  type RegisteredRouter,
  useLocation,
  useNavigate,
  type ValidateLinkOptions,
} from "@tanstack/react-router";

export type Tab<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> = {
  label: string;
  link: ValidateLinkOptions<TRouter, TOptions>;
};

export type Props<TRouter extends RegisteredRouter, TOptions> = {
  tabs: Tab<TRouter, TOptions>[];
};
export function RouterTabs<TRouter extends RegisteredRouter, TOptions>({
  tabs,
}: Props<TRouter, TOptions>) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTabIndex = tabs.findIndex(
    (tab) => tab.link.to === location.pathname,
  );

  const goToTab = (index: number) => {
    const tab = tabs[index];
    if (!tab) {
      console.warn(`No tab found for index ${index}`);
      return;
    }

    navigate(tab.link);
  };

  return (
    <ScoutTabs
      value={activeTabIndex}
      onScoutChange={(e) => goToTab(e.detail.value)}
    >
      {tabs.map((tab) => (
        <ScoutTabsTab key={tab.label}>{tab.label}</ScoutTabsTab>
      ))}
    </ScoutTabs>
  );
}
