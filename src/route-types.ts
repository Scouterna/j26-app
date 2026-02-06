export type AppBarAction = {
  icon: string;
  label: string;
} & (
  | {
      onClick: () => void;
    }
  | {
      to: string;
    }
);

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    /**
     * Translation string for the page name, shown in the app bar.
     */
    pageName?: string;
    /**
     * Optional action button shown on the right side of the app bar.
     */
    appBarAction?: AppBarAction;
    /**
     * If set, this page won't display a back arrow in the app bar
     */
    treatAsRoot?: boolean;
  }
}
