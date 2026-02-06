import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/info/notifications")({
  component: Index,
  staticData: {
    pageName: "page.info.title",
    treatAsRoot: true,
  },
});

function Index() {
  return <>Händelser</>;
}
