import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppBar } from "../components/AppBar";
import { BottomNavigation } from "../components/BottomNavigation";
import { InstallBanner } from "../components/InstallBanner";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

function RouteComponent() {
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
