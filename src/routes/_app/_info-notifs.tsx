import { ScoutTabs, ScoutTabsTab } from "@scouterna/ui-react";
import SettingsIcon from "@tabler/icons/outline/settings.svg?raw";
import {
  createFileRoute,
  Outlet,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useTranslate } from "@tolgee/react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/_info-notifs")({
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
  const router = useRouter();
  const routerState = useRouterState();
  const { t } = useTranslate("app");

  const routes = [
    {
      name: t("page.info.tabs.notifications.title"),
      route: "/notifs",
    },
    {
      name: t("page.info.tabs.information.title"),
      route: "/info",
    },
  ];

  const location = routerState.resolvedLocation ?? routerState.location;

  const getActiveTab = () => {
    const activeRoute = routes.find((route) =>
      location.pathname.endsWith(route.route),
    );
    return activeRoute ? routes.indexOf(activeRoute) : 0;
  };

  const [activeTab, setActiveTab] = useState(getActiveTab);
  // biome-ignore lint/correctness/useExhaustiveDependencies: We use React Compiler
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location]);

  const onTabChange = ({ detail }: CustomEvent<{ value: number }>) => {
    const index = detail.value;
    const route = routes[index];
    setActiveTab(index);
    router.navigate({
      to: route.route,
    });
  };

  return (
    <div>
      <div className="px-2">
        <ScoutTabs value={activeTab} onScoutChange={onTabChange}>
          {routes.map((route, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: This will never change
            <ScoutTabsTab key={index}>{route.name}</ScoutTabsTab>
          ))}
        </ScoutTabs>
      </div>
      <Outlet />
    </div>
  );
}
