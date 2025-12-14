import { ScoutListView, ScoutListViewItem } from "@scouterna/ui-react";
import { createFileRoute, createLink } from "@tanstack/react-router";
import type { ComponentProps } from "react";

export const ScoutListViewItemLink = createLink(
  ({ ref, ...props }: ComponentProps<typeof ScoutListViewItem>) => {
    return <ScoutListViewItem ref={ref} type="link" {...props} />;
  },
);

export const Route = createFileRoute("/more")({
  component: More,
});

function More() {
  return (
    <div>
      <ScoutListView>
        <ScoutListViewItemLink primary="About" to="/about" />
      </ScoutListView>
    </div>
  );
}
