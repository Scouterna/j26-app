import { ScoutListView, ScoutLoader } from "@scouterna/ui-react";
import { createFileRoute } from "@tanstack/react-router";
import { ScoutListViewItemLink } from "../../../../components/links";
import { useCollectionList } from "../../../../strapi/hooks";

export const Route = createFileRoute("/_app/_info-notifs/info/")({
  component: Index,
});

function Index() {
  const { data, isLoading } = useCollectionList("info-pages");

  if (isLoading) {
    return <ScoutLoader className="mt-20" />;
  }

  return (
    <ScoutListView>
      {data?.data.map((item) => (
        <ScoutListViewItemLink
          key={item.id}
          icon={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">${item.icon?.iconData}</svg>`}
          primary={item.title}
          secondary={item.summary}
          to="/info/$id"
          params={{
            id: item.documentId,
          }}
        />
      ))}
    </ScoutListView>
  );
}
