import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Sidebar } from "../components/microfrontends/sidebar/Sidebar";

const RootLayout = () => (
  <>
    <div className="flex h-screen w-screen">
      <Sidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
