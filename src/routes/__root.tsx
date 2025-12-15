import { ScoutBottomBarItem } from "@scouterna/ui-react";
import { createLink, createRootRoute, Outlet } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { BottomNavigation } from "../components/BottomNavigation";

export const ScoutBottomBarItemLink = createLink(
  ({ ref, ...props }: ComponentProps<typeof ScoutBottomBarItem>) => {
    return <ScoutBottomBarItem ref={ref} type="link" {...props} />;
  },
);

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
