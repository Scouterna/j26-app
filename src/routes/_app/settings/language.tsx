import { createFileRoute } from "@tanstack/react-router";
import { LanguageSelector } from "../../../components/LanguageSelector";

export const Route = createFileRoute("/_app/settings/language")({
  component: RouteComponent,
  staticData: {
    pageName: "page.language.title",
  },
});

function RouteComponent() {
  return <LanguageSelector />;
}
