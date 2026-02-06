import {
  ScoutCard,
  ScoutListView,
  ScoutListViewItem,
  ScoutLoader,
} from "@scouterna/ui-react";
import { createFileRoute } from "@tanstack/react-router";
// import { useCollectionList } from "../../../strapi/hooks";

export const Route = createFileRoute("/_app/info/information")({
  component: Index,
  staticData: {
    pageName: "page.info.title",
    treatAsRoot: true,
  },
});

function Index() {
  // const { data, isLoading } = useCollectionList("info-pages");

  // if (isLoading) {
  //   return <ScoutLoader className="mt-20" />;
  // }

  return (
    <>
      <div className="px-2 py-4">
        <ScoutCard>
          <p>Här finner du viktig information under jamboreen.</p>
        </ScoutCard>
      </div>
      Placeholder
      {/* <ScoutListView>
        {data?.data.map((item) => (
          <ScoutListViewItem
            key={item.id}
            icon={item.icon?.iconData}
            primary={item.title}
            secondary={item.summary}
          />
        ))}
      </ScoutListView> */}
    </>
  );
}
