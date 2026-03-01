import {
  ScoutDivider,
  ScoutListView,
  ScoutListViewItem,
  ScoutListViewSubheader,
} from "@scouterna/ui-react";
import LogoutIcon from "@tabler/icons/outline/logout.svg?raw";
import UserIcon from "@tabler/icons/outline/user.svg?raw";
import { useTranslate } from "@tolgee/react";
import { useAtomValue } from "jotai";
import { userAtom } from "../../auth/auth";
import { ScoutListViewItemLink } from "../../components/links";
import type { appConfig } from "../../dynamic-routes/app-config";
import { useDynamicRoutes } from "../../dynamic-routes/dynamic-routes-context";
import { useIcon } from "../../icons/icons";
import { cn } from "../../utils";

type Page = typeof appConfig.Page.infer;
type Group = typeof appConfig.Group.infer;
type NavigationItem = typeof appConfig.NavigationItem.infer;

function DynamicPageItem({ page }: { page: Page }) {
  const { t } = useTranslate("navigation");

  const icon = useIcon(page.icon);

  return (
    <ScoutListViewItemLink primary={t(page.label)} icon={icon} to={page.path} />
  );
}

function DynamicGroupItem({ group }: { group: Group }) {
  const { t } = useTranslate("navigation");

  return (
    <>
      <ScoutListViewSubheader text={t(group.label)} />

      {group.children.map((page) => (
        <DynamicPageItem key={`${page.label}_${page.path}`} page={page} />
      ))}
    </>
  );
}

function filterOutPagesById(
  items: NavigationItem[],
  idsToFilter: string[],
): NavigationItem[] {
  return items
    .map((item) => {
      if (item.type === "page") {
        if (idsToFilter.includes(item.id)) {
          return null;
        }
        return item;
      } else if (item.type === "group") {
        const filteredChildren = item.children.filter(
          (child) => !idsToFilter.includes(child.id),
        );
        if (filteredChildren.length === 0) {
          return null;
        }
        return {
          ...item,
          children: filteredChildren,
        };
      }
      return null;
    })
    .filter((item) => item != null);
}

function UserItem() {
  const { t } = useTranslate("app");

  const user = useAtomValue(userAtom);

  if (!user) {
    return (
      <ScoutListViewItem
        type="link"
        primary={t("current_user_item.sign_in")}
        icon={UserIcon}
        href="https://app.dev.j26.se/auth/login?redirect_uri=https://app.dev.j26.se/more&silent=false"
      />
    );
  }

  return (
    <ScoutListViewItem
      primary={t("current_user_item.sign_out")}
      secondary={t("current_user_item.signed_in_as", {
        name: user.name,
      })}
      icon={LogoutIcon}
      onScoutClick={() => alert("Not implemented yet")}
    />
  );
}

export type Props = {
  className?: string;
  includeBottomNavItems?: boolean;
  useFullHeight?: boolean;
};

export function MoreList({
  className,
  includeBottomNavItems,
  useFullHeight,
}: Props) {
  const { configs, bottomNavItems, allPages } = useDynamicRoutes();
  const routeEntries = Object.entries(configs);

  const filteredRouteEntries = routeEntries
    .map(([url, config]) => {
      const filteredNavigation = filterOutPagesById(
        config.navigation,
        bottomNavItems,
      );
      return [url, { ...config, navigation: filteredNavigation }] as const;
    })
    .filter(([_, config]) => config.navigation.length > 0);

  if (includeBottomNavItems) {
    const pages = bottomNavItems
      .filter((pageId) => pageId !== "page_more")
      .map((pageId) => allPages.find((page) => page.id === pageId))
      .filter((page) => page != null);

    if (pages.length > 0) {
      filteredRouteEntries.unshift(["bottomNav", { navigation: pages }]);
    }
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <div className={cn(useFullHeight && "flex-1")}>
        {filteredRouteEntries.map(([url, config]) => (
          <>
            <ScoutListView key={`${url}_item`}>
              {config.navigation.map((navItem) => {
                if (navItem.type === "page") {
                  return (
                    <DynamicPageItem
                      key={`${navItem.label}_${navItem.path}`}
                      page={navItem}
                    />
                  );
                } else if (navItem.type === "group") {
                  return (
                    <DynamicGroupItem key={navItem.label} group={navItem} />
                  );
                }

                return null;
              })}
            </ScoutListView>

            <ScoutDivider key={`${url}_divider`} />
          </>
        ))}
      </div>

      <ScoutListView>
        {useFullHeight && <ScoutDivider />}
        <UserItem />
      </ScoutListView>
    </div>
  );
}
