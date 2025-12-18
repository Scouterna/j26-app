import { createFileRoute } from "@tanstack/react-router";
import { IframeRouter } from "../components/microfrontends/IframeRouter";

export const Route = createFileRoute("/app/$")({
  component: RouteComponent,
});

function RouteComponent() {
  const { _splat: path } = Route.useParams();

  return (
    <IframeRouter
      route="/app/$"
      baseUrl="/_services/"
      path={`./${path ?? ""}`}
      name="REPLACE ME LOL"
    />
  );
}
