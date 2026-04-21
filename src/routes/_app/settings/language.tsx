import { createFileRoute } from "@tanstack/react-router";
import { LanguageSelector } from "../../../components/LanguageSelector";
import { PageContainer } from "../../../components/PageContainer";

export const Route = createFileRoute("/_app/settings/language")({
  component: RouteComponent,
  staticData: {
    pageName: "page.language.title",
  },
});

function RouteComponent() {
  return (
    <PageContainer>
      <LanguageSelector />
    </PageContainer>
  );
}
