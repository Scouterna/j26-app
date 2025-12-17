import { ScoutAppBar } from "@scouterna/ui-react";
import ArrowLeftIcon from "@tabler/icons/outline/arrow-left.svg?raw";
import { useMatches, useRouter } from "@tanstack/react-router";
import { T, useTranslate } from "@tolgee/react";
import { useMemo } from "react";
import { ScoutButtonLink } from "./links";

export function AppBar() {
  const { t } = useTranslate("app");
  const router = useRouter();

  const matches = useMatches();
  const title = matches
    .map((match) => match.staticData?.pageName)
    .filter((match) => match !== undefined)
    .pop();

  // const parentRoute = useMemo(() => {
  //   const parentRoute = matches[matches.length - 2];
  //   if (!parentRoute || parentRoute.routeId === "__root__") {
  //     return null;
  //   }

  //   return parentRoute;
  // }, [matches]);

  // console.log(matches);

  const parentRoute = useMemo(() => {
    if (matches.length < 2) {
      return null;
    }

    const route = matches[matches.length - 1];
    const parentPath = route.pathname.replace(/[^/]*\/*$/, "");
    const parentMatches = router.matchRoutes(parentPath);

    if (parentMatches.length < 2) {
      return null;
    }

    const parent = parentMatches[parentMatches.length - 1];

    if (parent.pathname === "/") {
      return null;
    }

    return parent;
  }, [matches, router]);

  // const parentRoute = router.routesByPath

  return (
    <ScoutAppBar titleText={title ? t(title) : undefined}>
      {parentRoute && (
        <ScoutButtonLink
          slot="prefix"
          icon={ArrowLeftIcon}
          iconOnly
          variant="text"
          to={parentRoute.pathname}
        >
          <T ns="app" keyName="appBar.back.label" />
        </ScoutButtonLink>
      )}
    </ScoutAppBar>
  );
}
