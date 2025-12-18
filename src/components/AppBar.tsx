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
    </ScoutAppBar>
  );
}
