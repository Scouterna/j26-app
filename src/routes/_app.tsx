import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { AppBar } from "../components/AppBar";
import { BottomNavigation } from "../components/BottomNavigation";
import { InstallBanner } from "../components/InstallBanner";
import { onboardedAtom } from "../onboarding";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const onboarded = useAtomValue(onboardedAtom);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We only want this to run on load
  useEffect(() => {
    if (!onboarded) {
      router.navigate({
        to: "/onboarding",
      });
    }
  }, []);

  return (
    <div className="flex flex-col app-container">
      <InstallBanner />

      <AppBar />

      <main className="flex-1">
        <Outlet />
      </main>

      <BottomNavigation />
    </div>
  );
}
