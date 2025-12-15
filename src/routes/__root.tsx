import { createRootRoute, Outlet } from "@tanstack/react-router";
import { BottomNavigation } from "../components/BottomNavigation";

const RootLayout = () => {
  return (
    <>
      <div className="flex flex-col h-screen w-screen">
        <main className="flex-1">
          <Outlet />
        </main>

        <BottomNavigation />
      </div>

      {/* <TanStackRouterDevtools /> */}
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
