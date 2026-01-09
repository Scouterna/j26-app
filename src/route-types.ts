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
    pageName?: string;
    appBarAction?: AppBarAction;
  }
}
