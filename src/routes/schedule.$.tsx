import { createFileRoute } from "@tanstack/react-router";
import { IframeRouter } from "../components/microfrontends/IframeRouter";

export const Route = createFileRoute("/schedule/$")({
  component: RouteComponent,
});

function RouteComponent() {
  const { _splat: path } = Route.useParams();

  return (
    <IframeRouter
      baseUrl="/dummy-page/"
      path={`./${path ?? ""}`}
      name="Schedule"
    />
  );
}
