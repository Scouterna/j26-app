import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "../../../components/PageContainer";
import { Notifications } from "./-notifications";

export const Route = createFileRoute("/_app/notifications/")({
  component: RouteComponent,
  staticData: {
    pageName: "page.info.tabs.notifications.title",
  },
});

function RouteComponent() {
  return (
    <PageContainer scrollable={false} className="flex flex-col">
      <Notifications />
    </PageContainer>
  );
}
