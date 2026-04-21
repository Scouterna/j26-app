import { createFileRoute } from "@tanstack/react-router";
import { MoreList } from "../../components/menu/MoreList";
import { PageContainer } from "../../components/PageContainer";

export const Route = createFileRoute("/_app/more/")({
  component: More,
  staticData: {
    pageName: "page.more.title",
  },
});
function More() {
  return (
    <PageContainer>
      <MoreList />
    </PageContainer>
  );
}
