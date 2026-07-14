import { useRegisterSW } from "virtual:pwa-register/react";
import {
  createFileRoute,
  Outlet,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { Suspense, useEffect } from "react";
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
// Debounce foreground signals so several firing at once don't stack up network
// checks (e.g. visibilitychange + a native "app-foregrounded" event together).
const MIN_UPDATE_CHECK_INTERVAL = 10 * 1000;

function RouteComponent() {
  const router = useRouter();
  const routerState = useRouterState();
  const onboarded = useAtomValue(onboardedAtom);
  const setPageTitle = useSetAtom(pageTitleAtom);

  useRegisterSW({
    onRegistered(registration) {
      if (!registration) return;

      let lastCheckedAt = 0;
      const checkForUpdate = async () => {
        if (registration.installing || !navigator) return;
        if ("connection" in navigator && !navigator.onLine) return;

        const now = Date.now();
        if (now - lastCheckedAt < MIN_UPDATE_CHECK_INTERVAL) return;
        lastCheckedAt = now;

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
      };

      // Periodic check for long-lived foreground sessions.
      setInterval(checkForUpdate, SW_UPDATE_INTERVAL);

      // Re-check whenever the app returns to the foreground — this is the path
      // that fixes reopened apps. A plain reopen never re-runs the on-load
      // registration check and the interval is suspended while backgrounded, so
      // without this a returning user never notices a new version. In the
      // browser/PWA this fires via visibilitychange; the native iOS WebView
      // wrapper (which keeps the page alive across resume and never reloads)
      // can additionally dispatch an "app-foregrounded" event to trigger it.
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          checkForUpdate();
        }
      });
      window.addEventListener("app-foregrounded", () => {
        checkForUpdate();
      });
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

        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <AppBar />

          <main className="flex-1 overflow-y-hidden">
            <Suspense>
              <Outlet />
            </Suspense>
          </main>

          <BottomNavigation />
        </div>
      </div>
    </div>
  );
}
