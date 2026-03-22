import { ScoutAppBar, ScoutButton } from "@scouterna/ui-react";
import ArrowLeftIcon from "@tabler/icons/outline/arrow-left.svg?raw";
import Menu2Icon from "@tabler/icons/outline/menu-2.svg?raw";
import {
  useCanGoBack,
  useLocation,
  useMatches,
  useRouter,
} from "@tanstack/react-router";
import { T, useTranslate } from "@tolgee/react";
import { useAtom, useAtomValue } from "jotai";
import { useMemo } from "react";
import { useDynamicRoutes } from "../dynamic-routes/dynamic-routes-context";
import { useIsDesktop } from "../hooks/breakpoint";
import type { AppBarAction } from "../route-types";
import { ScoutButtonLink } from "./links";
import { sideMenuOpenAtom } from "./menu/menuState";
import { iframeAppBarAtom } from "./microfrontends/iframeAppBarAtom";

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
  const [sideMenuOpen, setSideMenuOpen] = useAtom(sideMenuOpenAtom);
  const isDesktop = useIsDesktop();
  const showSideMenu = isDesktop && sideMenuOpen;
  const iframeAppBar = useAtomValue(iframeAppBarAtom);

  const isOnRootPage = useMemo(() => {
    const bottomPages = allPages.filter((page) =>
      bottomNavItems.includes(page.id),
    );
    const bottomPaths = bottomPages.map((page) => page.path.replace(/\/$/, ""));
    return bottomPaths.includes(location.pathname.replace(/\/$/, ""));
  }, [allPages, bottomNavItems, location]);

  const routeTitle = matches
    .map((match) => match.staticData?.pageName)
    .filter((match) => match !== undefined)
    .pop();

  const routeAction = matches
    .map((match) => match.staticData?.appBarAction)
    .filter((match) => match !== undefined)
    .pop();

  const titleText =
    iframeAppBar !== null
      ? iframeAppBar.title
      : routeTitle
        ? t(routeTitle)
        : undefined;

  return (
    <ScoutAppBar titleText={titleText}>
      {isDesktop && !showSideMenu && (
        <ScoutButton
          slot="prefix"
          icon={Menu2Icon}
          iconOnly
          variant="text"
          onClick={() => {
            setSideMenuOpen(true);
          }}
        >
          <T ns="app" keyName="appBar.openMenu.label" />
        </ScoutButton>
      )}

      {!isDesktop && !isOnRootPage && canGoBack && (
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

      {iframeAppBar === null && routeAction && <Action action={routeAction} />}
    </ScoutAppBar>
  );
}
