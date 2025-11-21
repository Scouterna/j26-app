import { ScoutBottomBar, ScoutBottomBarItem } from "@scouterna/ui-react";
import {
  createRootRoute,
  Outlet,
  useLocation,
  useMatchRoute,
  useNavigate,
} from "@tanstack/react-router";
import { useTranslate } from "@tolgee/react";

import BonfireIcon from "iconoir/icons/bonfire.svg?raw";
import CalendarIcon from "iconoir/icons/calendar.svg?raw";
import MapIcon from "iconoir/icons/map.svg?raw";
import MoreHorizIcon from "iconoir/icons/more-horiz.svg?raw";
import { useCallback } from "react";

const menuItems = [
  {
    icon: CalendarIcon,
    label: "page.calendar.label",
    path: "/schedule/my.html",
  },
  {
    icon: MapIcon,
    label: "page.map.label",
    path: "/map",
  },
  {
    icon: BonfireIcon,
    label: "page.activities.label",
    path: "/schedule/activities.html",
  },
  {
    icon: MoreHorizIcon,
    label: "page.more.label",
    path: "/more",
  },
];

const RootLayout = () => {
  const { t } = useTranslate("navigation");
  const navigate = useNavigate();
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
            <ScoutBottomBarItem
              key={item.path}
              icon={item.icon}
              label={t(item.label)}
              type="link"
              // We're handing onClick but also providing href for accessibility
              href={item.path}
              active={
                !!reactiveMatchRoute({
                  to: item.path,
                })
              }
              onClick={(e) => {
                // Let ctrl+click open in new tab
                if (e.ctrlKey || e.metaKey) {
                  return;
                }
                e.preventDefault();
                navigate({
                  to: item.path,
                });
              }}
            />
          ))}
        </ScoutBottomBar>
      </div>
      {/* <TanStackRouterDevtools /> */}
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
