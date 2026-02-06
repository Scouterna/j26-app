import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/info/")({
  loader: () => {
    throw redirect({ to: "/info/notifications" });
  },
});
