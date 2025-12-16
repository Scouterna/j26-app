import { T } from "@tolgee/react";
import { ScoutButtonLink } from "./links";

export function NotFound() {
  return (
    <div className="px-4">
      <h1 className="scout-type-heading-base">
        <T keyName="not_found.title" ns="app" />
      </h1>

      <p className="scout-type-body-base mb-4">
        <T keyName="not_found.message" ns="app" />
      </p>

      <ScoutButtonLink to="/" variant="primary">
        <T keyName="not_found.go_to_map.label" ns="app" />
      </ScoutButtonLink>
    </div>
  );
}
