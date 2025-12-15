import {
  ScoutDivider,
  ScoutListView,
  ScoutListViewItem,
  ScoutListViewSubheader,
} from "@scouterna/ui-react";
import { createFileRoute, createLink } from "@tanstack/react-router";
import { useTranslate } from "@tolgee/react";
import type { ComponentProps } from "react";
import type { appConfig } from "../dynamic-routes/app-config";
import { useDynamicRoutes } from "../dynamic-routes/dynamic-routes-context";
import { useIcon } from "../icons/icons";

export const ScoutListViewItemLink = createLink(
  ({ ref, ...props }: ComponentProps<typeof ScoutListViewItem>) => {
    return <ScoutListViewItem ref={ref} type="link" {...props} />;
  },
);

type Page = typeof appConfig.Page.infer;
type Group = typeof appConfig.Group.infer;

export const Route = createFileRoute("/more")({
  component: More,
});

function DynamicPageItem({ page }: { page: Page }) {
  const { t } = useTranslate("navigation");

  const icon = useIcon(page.icon);

  return <ScoutListViewItem primary={t(page.label)} icon={icon} />;
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

function More() {
  const dynamicRoutes = useDynamicRoutes();
  const routeEntries = Object.entries(dynamicRoutes ?? {});

  return (
    <>
      <h1 className="text-heading-xs mb-2 px-4 py-2">Genvägar</h1>

      {routeEntries.map(([url, config], index) => (
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
    </>
  );
}
