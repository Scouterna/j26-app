import { ScoutAppBar, ScoutButton } from "@scouterna/ui-react";
import ArrowLeftIcon from "@tabler/icons/outline/arrow-left.svg?raw";
import {
  useCanGoBack,
  useLocation,
  useMatches,
  useRouter,
} from "@tanstack/react-router";
import { T, useTranslate } from "@tolgee/react";
import { useMemo } from "react";
import { useDynamicRoutes } from "../dynamic-routes/dynamic-routes-context";
import type { AppBarAction } from "../route-types";
import { ScoutButtonLink } from "./links";

const Action = ({ action }: { action: AppBarAction }) => {
  const Tag = "to" in action ? ScoutButtonLink : ScoutButton;

  const props =
    "to" in action
      ? {
          to: action.to,
        }
      : {
          onClick: action.onClick,
        };

  return (
    <Tag slot="suffix" icon={action.icon} iconOnly variant="text" {...props}>
      <T ns="app" keyName={action.label} />
    </Tag>
  );
};
export function AppBar() {
  const { t } = useTranslate("app");
  const router = useRouter();
  const matches = useMatches();
  const location = useLocation();
  const canGoBack = useCanGoBack();
  const { allPages, bottomNavItems } = useDynamicRoutes();

  const isOnRootPage = useMemo(() => {
    const bottomPages = allPages.filter((page) =>
      bottomNavItems.includes(page.id),
    );
    const bottomPaths = bottomPages.map((page) => page.path.replace(/\/$/, ""));
    return bottomPaths.includes(location.pathname.replace(/\/$/, ""));
  }, [allPages, bottomNavItems, location]);

  const title = matches
    .map((match) => match.staticData?.pageName)
    .filter((match) => match !== undefined)
    .pop();

  const appBarAction = matches
    .map((match) => match.staticData?.appBarAction)
    .filter((match) => match !== undefined)
    .pop();

  return (
    <ScoutAppBar titleText={title ? t(title) : undefined}>
      {!isOnRootPage && canGoBack && (
        <ScoutButton
          slot="prefix"
          icon={ArrowLeftIcon}
          iconOnly
          variant="text"
          onClick={() => {
            router.history.back();
          }}
        >
          <T ns="app" keyName="appBar.back.label" />
        </ScoutButton>
      )}

      {appBarAction && <Action action={appBarAction} />}
    </ScoutAppBar>
  );
}
