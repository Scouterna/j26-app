import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AppBar } from "../components/AppBar";
import { BottomNavigation } from "../components/BottomNavigation";

const RootLayout = () => {
  return (
    <div className="flex flex-col h-screen w-screen">
      <AppBar />

      <main className="flex-1">
        <Outlet />
      </main>

      <BottomNavigation />
    </div>
  );
};

export const Route = createRootRoute({ component: RootLayout });
