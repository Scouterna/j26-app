import { createFileRoute } from "@tanstack/react-router";
import { MoreList } from "../../components/menu/MoreList";

export const Route = createFileRoute("/_app/more/")({
  component: More,
  staticData: {
    pageName: "page.more.title",
  },
});
function More() {
  return <MoreList />;
}
