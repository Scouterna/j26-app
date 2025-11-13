import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <h3>
        This page is rendered by the main app. It's not part of any
        microfrontend.
      </h3>
    </div>
  );
}
