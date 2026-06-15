import { ScoutListView, ScoutLoader } from "@scouterna/ui-react";
import { createFileRoute } from "@tanstack/react-router";

import { ScoutListViewItemLink } from "../../components/links";
import { PageContainer } from "../../components/PageContainer";
import { useCollectionList } from "../../strapi/hooks";

export const Route = createFileRoute("/_app/information/")({
  component: RouteComponent,
  staticData: {
    pageName: "page.info.title",
  },
});

function RouteComponent() {
  const { data, isLoading } = useCollectionList("info-page");

  return (
    <PageContainer scrollable={false} className="flex flex-col">
      {isLoading ? (
        <ScoutLoader className="mt-20" />
      ) : (
        <ScoutListView>
          {data?.docs.map((item) => (
            <ScoutListViewItemLink
              key={item.id}
              icon={item.icon}
              primary={item.title}
              secondary={item.summary}
              to="/information/$id"
              params={{
                id: String(item.id),
              }}
            />
          ))}
        </ScoutListView>
      )}
    </PageContainer>
  );
}
