import { ScoutListView, ScoutLoader } from "@scouterna/ui-react";

import { ScoutListViewItemLink } from "../../../../components/links";
import { useCollectionList } from "../../../../strapi/hooks";

export function Information() {
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
