import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import { createFileRoute } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { pageTitleAtom } from "../../pageState";
import { useCollectionSingle } from "../../strapi/hooks";

export const Route = createFileRoute("/_app/info/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data, isLoading } = useCollectionSingle("info-pages", id);

  const setPageTitle = useSetAtom(pageTitleAtom);
  setPageTitle(data?.data.title);

  if (isLoading) {
    return "Loading...";
  }

  if (!data) {
    return "Something went wrong while loading the content";
  }

  return (
    <div>
      <div className="prose">
        {data && <BlocksRenderer content={data.data.content} />}
      </div>
    </div>
  );
}
