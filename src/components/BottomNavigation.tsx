import { ScoutBottomBar, ScoutBottomBarItem } from "@scouterna/ui-react";
import { createLink, useLocation, useMatchRoute } from "@tanstack/react-router";
import { useTranslate } from "@tolgee/react";
import { type ComponentProps, useCallback } from "react";
import type { appConfig } from "../dynamic-routes/app-config";
import { useDynamicRoutes } from "../dynamic-routes/dynamic-routes-context";
import { useIcon } from "../icons/icons";

export const ScoutBottomBarItemLink = createLink(
  ({ ref, ...props }: ComponentProps<typeof ScoutBottomBarItem>) => {
    return <ScoutBottomBarItem ref={ref} type="link" {...props} />;
  },
);

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

  const dynamicRoutes = useDynamicRoutes();
  const allPages = Object.values(dynamicRoutes.configs).flatMap((config) =>
    config.navigation.flatMap((navItem) => {
      if (navItem.type === "group") {
        return navItem.children;
      }
      return navItem;
    }),
  );

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
