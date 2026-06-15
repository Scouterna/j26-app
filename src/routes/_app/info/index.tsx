import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "../../../components/PageContainer";
import { Information } from "./-information";

export const Route = createFileRoute("/_app/info/")({
  component: RouteComponent,
  staticData: {
    pageName: "page.info.title",
  },
});

function RouteComponent() {
  return (
    <PageContainer scrollable={false} className="flex flex-col">
      <Information />
    </PageContainer>
  );
}
