import {
  createFileRoute,
  Outlet,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { AppBar } from "../components/AppBar";
import { BottomNavigation } from "../components/BottomNavigation";
import { DevBanner } from "../components/DevBanner";
import { InstallBanner } from "../components/InstallBanner";
import { SideMenu } from "../components/menu/SideMenu";
import { onboardedAtom } from "../onboarding";
import { pageTitleAtom } from "../pageState";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const routerState = useRouterState();
  const onboarded = useAtomValue(onboardedAtom);
  const setPageTitle = useSetAtom(pageTitleAtom);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We only want this to run on load
  useEffect(() => {
    if (!onboarded) {
      router.navigate({
        to: "/onboarding",
      });
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to react to router state changes
  useEffect(() => {
    setPageTitle(null);
  }, [setPageTitle, routerState.location]);

  return (
    <div className="flex flex-col app-container">
      <DevBanner />
      <InstallBanner />

      <div className="flex-1 flex min-h-0">
        <SideMenu />

        <div className="flex-1 flex flex-col min-h-0">
          <AppBar />

          <main className="flex-1 overflow-y-hidden">
            <Outlet />
          </main>

          <BottomNavigation />
        </div>
      </div>
    </div>
  );
}
