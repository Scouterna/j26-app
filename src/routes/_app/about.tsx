import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "../../components/PageContainer";

export const Route = createFileRoute("/_app/about")({
  component: About,
});

function About() {
  return <PageContainer className="p-4">Hello from About!</PageContainer>;
}
