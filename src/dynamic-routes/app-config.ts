import { scope } from "arktype";

export const appConfig = scope({
  Page: {
    type: '"page"',
    id: "string",
    label: "string",
    "icon?": "string",
    path: "string",
  },
  Group: {
    type: '"group"',
    id: "string",
    label: "string",
    children: "Page[]",
  },
  NavigationItem: "Page | Group",
  AppConfig: {
    navigation: "NavigationItem[]",
  },
}).export();
