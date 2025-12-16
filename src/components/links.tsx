import {
  ScoutBottomBarItem,
  ScoutButton,
  ScoutListViewItem,
} from "@scouterna/ui-react";
import { createLink } from "@tanstack/react-router";
import type { ComponentProps } from "react";

export const ScoutBottomBarItemLink = createLink(
  ({ ref, ...props }: ComponentProps<typeof ScoutBottomBarItem>) => {
    return <ScoutBottomBarItem ref={ref} type="link" {...props} />;
  },
);

export const ScoutListViewItemLink = createLink(
  ({ ref, ...props }: ComponentProps<typeof ScoutListViewItem>) => {
    return <ScoutListViewItem ref={ref} type="link" {...props} />;
  },
);

export const ScoutButtonLink = createLink(
  ({ ref, ...props }: ComponentProps<typeof ScoutButton>) => {
    return <ScoutButton ref={ref} type="link" {...props} />;
  },
);
