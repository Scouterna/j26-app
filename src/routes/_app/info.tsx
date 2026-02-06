import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RouterTabs } from "../../components/RouterTabs";

export const Route = createFileRoute("/_app/info")({
  component: Index,
  staticData: {
    pageName: "page.info.title",
  },
});

function Index() {
  return (
    <>
      <RouterTabs
        tabs={[
          {
            label: "Händelser",
            link: {
              to: "/info/notifications",
            },
          },
          {
            label: "Information",
            link: {
              to: "/info/information",
            },
          },
        ]}
      />

      <Outlet />
    </>
  );
}
