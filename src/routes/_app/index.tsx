import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <p>
        This page is rendered by the main app. It's not part of any
        microfrontend.
      </p>

      <p>Dummy change!</p>
    </div>
  );
}
