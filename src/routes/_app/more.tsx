import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { useIsDesktop } from "../../hooks/breakpoint";

export const Route = createFileRoute("/_app/more")({
  component: RouteComponent,
});

function RouteComponent() {
  const isDesktop = useIsDesktop();
  const router = useRouter();

  if (isDesktop) {
    // This should really be done in beforeLoad, but we can't use hooks there.
    router.navigate({
      to: "/",
      replace: true,
    });
  }

  return <Outlet />;
}
