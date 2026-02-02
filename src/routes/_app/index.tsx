import { ScoutLoader } from "@scouterna/ui-react";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import { createFileRoute } from "@tanstack/react-router";
import { useSingle } from "../../strapi/hooks";

export const Route = createFileRoute("/_app/")({
  component: Index,
});

function Index() {
  const { data, isLoading } = useSingle("front-page");

  if (isLoading) {
    return <ScoutLoader className="mt-20" />;
  }

  return (
    <div className="p-2">
      <p>
        This page is rendered by the main app. It's not part of any
        microfrontend.
      </p>

      <p>Take some Strapi content:</p>

      <div className="prose">
        {data && <BlocksRenderer content={data.data.content} />}
      </div>
    </div>
  );
}
