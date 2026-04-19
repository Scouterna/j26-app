import { ScoutListView, ScoutLoader } from "@scouterna/ui-react";
import { createFileRoute } from "@tanstack/react-router";
import { ScoutListViewItemLink } from "../../../../components/links";
import { useCollectionList } from "../../../../strapi/hooks";

export const Route = createFileRoute("/_app/_info-notifs/info/")({
  component: Index,
});

function Index() {
  const { data, isLoading } = useCollectionList("info-page");

  if (isLoading) {
    return <ScoutLoader className="mt-20" />;
  }

  return (
    <ScoutListView>
      {data?.docs.map((item) => (
        <ScoutListViewItemLink
          key={item.id}
          icon={item.icon}
          primary={item.title}
          secondary={item.summary}
          to="/info/$id"
          params={{
            id: String(item.id),
          }}
        />
      ))}
    </ScoutListView>
  );
}
