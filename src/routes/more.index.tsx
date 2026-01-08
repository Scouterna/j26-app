import {
  ScoutDivider,
  ScoutListView,
  ScoutListViewItem,
  ScoutListViewSubheader,
} from "@scouterna/ui-react";
import LanguageIcon from "@tabler/icons/outline/language.svg?raw";
import LogoutIcon from "@tabler/icons/outline/logout.svg?raw";
import UserIcon from "@tabler/icons/outline/user.svg?raw";
import { createFileRoute } from "@tanstack/react-router";
import { useTolgee, useTranslate } from "@tolgee/react";
import { useAtomValue } from "jotai";
import { use } from "react";
import { userAtom } from "../auth/auth";
import { ScoutListViewItemLink } from "../components/links";
import type { appConfig } from "../dynamic-routes/app-config";
import { useDynamicRoutes } from "../dynamic-routes/dynamic-routes-context";
import { useIcon } from "../icons/icons";
import { languageNamesPromise } from "../tolgee";

type Page = typeof appConfig.Page.infer;
type Group = typeof appConfig.Group.infer;
type NavigationItem = typeof appConfig.NavigationItem.infer;

export const Route = createFileRoute("/more/")({
  component: More,
  staticData: {
    pageName: "page.more.title",
  },
});

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
      to="/more/language"
    />
  );
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

function More() {
  const { configs, bottomNavItems } = useDynamicRoutes();
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

  return (
    <>
      {filteredRouteEntries.map(([url, config], index) => (
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
                return <DynamicGroupItem key={navItem.label} group={navItem} />;
              }

              return null;
            })}
          </ScoutListView>
          {index < routeEntries.length - 1 && (
            <ScoutDivider key={`${url}_divider`} />
          )}
        </>
      ))}

      <ScoutListView>
        <LanguageItem />
        <UserItem />
      </ScoutListView>
    </>
  );
}
