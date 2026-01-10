import { createFileRoute } from "@tanstack/react-router";
import { IframeRouter } from "../../components/microfrontends/IframeRouter";

export const Route = createFileRoute("/_app/app/$")({
  component: RouteComponent,
});

function RouteComponent() {
  const { _splat: path } = Route.useParams();

  return (
    <IframeRouter
      route="/app/$"
      baseUrl="/_services/"
      path={`./${path ?? ""}`}
      // TODO: Remove placeholder name
      name="PAGE TITLE PLACEHOLDER"
    />
  );
}
