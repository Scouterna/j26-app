import { ScoutBottomBar, ScoutBottomBarItem } from "@scouterna/ui-react";
import CalendarEventIcon from "@tabler/icons/outline/calendar-event.svg?raw";
import CampfireIcon from "@tabler/icons/outline/campfire.svg?raw";
import DotsIcon from "@tabler/icons/outline/dots.svg?raw";
import MapIcon from "@tabler/icons/outline/map.svg?raw";
import {
  createLink,
  createRootRoute,
  Outlet,
  useLocation,
  useMatchRoute,
} from "@tanstack/react-router";
import { useTranslate } from "@tolgee/react";
import { type ComponentProps, useCallback } from "react";

export const ScoutBottomBarItemLink = createLink(
  ({ ref, ...props }: ComponentProps<typeof ScoutBottomBarItem>) => {
    return <ScoutBottomBarItem ref={ref} type="link" {...props} />;
  },
);

const menuItems = [
  {
    icon: CalendarEventIcon,
    label: "page.calendar.label",
    path: "/schedule/my.html",
  },
  {
    icon: MapIcon,
    label: "page.map.label",
    path: "/map",
  },
  {
    icon: CampfireIcon,
    label: "page.activities.label",
    path: "/schedule/activities.html",
  },
  {
    icon: DotsIcon,
    label: "page.more.label",
    path: "/more",
  },
];

const RootLayout = () => {
  const { t } = useTranslate("navigation");
  const matchRoute = useMatchRoute();
  const location = useLocation();

  // biome-ignore lint/correctness/useExhaustiveDependencies: This is some voodoo magic
  const reactiveMatchRoute = useCallback(
    (...params: Parameters<typeof matchRoute>) => {
      return matchRoute(...params);
    },
    [location],
  );

  return (
    <>
      <div className="flex flex-col h-screen w-screen">
        <main className="flex-1">
          <Outlet />
        </main>

        <ScoutBottomBar>
          {menuItems.map((item) => (
            <ScoutBottomBarItemLink
              key={item.path}
              icon={item.icon}
              label={t(item.label)}
              to={item.path}
              active={
                !!reactiveMatchRoute({
                  to: item.path,
                })
              }
            />
          ))}
        </ScoutBottomBar>
      </div>
      {/* <TanStackRouterDevtools /> */}
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
