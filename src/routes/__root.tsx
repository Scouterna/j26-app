import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AppBar } from "../components/AppBar";
import { BottomNavigation } from "../components/BottomNavigation";
import { InstallBanner } from "../components/InstallBanner";

const RootLayout = () => {
  return (
    <div className="flex flex-col h-dvh w-screen">
      <InstallBanner />

      <AppBar />

      <main className="flex-1">
        <Outlet />
      </main>

      <BottomNavigation />
    </div>
  );
};

export const Route = createRootRoute({ component: RootLayout });
