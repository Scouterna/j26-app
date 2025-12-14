import { scope } from "arktype";

export const appConfig = scope({
  Page: {
    type: '"page"',
    label: "string",
    "icon?": "string",
    path: "string",
  },
  Group: {
    type: '"group"',
    label: "string",
    children: "Page[]",
  },
  NavigationItem: "Page | Group",
  AppConfig: {
    navigation: "NavigationItem[]",
  },
}).export();
