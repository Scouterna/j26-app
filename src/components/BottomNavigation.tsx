import { ScoutBottomBar } from "@scouterna/ui-react";
import { useLocation, useMatchRoute } from "@tanstack/react-router";
import { useTranslate } from "@tolgee/react";
import { useCallback } from "react";
import type { appConfig } from "../dynamic-routes/app-config";
import { useDynamicRoutes } from "../dynamic-routes/dynamic-routes-context";
import { useIcon } from "../icons/icons";
import { ScoutBottomBarItemLink } from "./links";

type Page = typeof appConfig.Page.infer;

function DynamicBottomBarItem({
  page,
  active,
}: {
  page: Page;
  active: boolean;
}) {
  const { t } = useTranslate("navigation");

  const icon = useIcon(page.icon);

  return (
    <ScoutBottomBarItemLink
      icon={icon}
      label={t(page.label)}
      to={page.path}
      active={active}
    />
  );
}

export function BottomNavigation() {
  const matchRoute = useMatchRoute();
  const location = useLocation();
  const { bottomNavItems } = useDynamicRoutes();

  // biome-ignore lint/correctness/useExhaustiveDependencies: This is some voodoo magic
  const reactiveMatchRoute = useCallback(
    (...params: Parameters<typeof matchRoute>) => {
      return matchRoute(...params);
    },
    [location],
  );

  const { allPages } = useDynamicRoutes();

  const pages = bottomNavItems
    .map((pageId) => allPages.find((page) => page.id === pageId))
    .filter((page) => page != null);

  return (
    <ScoutBottomBar>
      {pages.map((page) => (
        <DynamicBottomBarItem
          key={page.id}
          page={page}
          active={
            !!reactiveMatchRoute({
              to: page.path,
            })
          }
        />
      ))}
    </ScoutBottomBar>
  );
}
