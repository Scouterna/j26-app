import { useRegisterSW } from "virtual:pwa-register/react";
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
import { PwaReloadBanner } from "../components/PwaReloadBanner";
import { onboardedAtom } from "../onboarding";
import { pageTitleAtom } from "../pageState";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

const SW_UPDATE_INTERVAL = 60 * 60 * 1000;

function RouteComponent() {
  const router = useRouter();
  const routerState = useRouterState();
  const onboarded = useAtomValue(onboardedAtom);
  const setPageTitle = useSetAtom(pageTitleAtom);

  useRegisterSW({
    onRegistered(registration) {
      if (!registration) return;

      setInterval(async () => {
        if (registration.installing || !navigator) return;
        if ("connection" in navigator && !navigator.onLine) return;

        const resp = await fetch("/sw.js", {
          cache: "no-store",
          headers: {
            cache: "no-store",
            "cache-control": "no-cache",
          },
        });

        if (resp?.status === 200) {
          await registration.update();
        }
      }, SW_UPDATE_INTERVAL);
    },
  });

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
      <PwaReloadBanner />

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
