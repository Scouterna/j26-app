import { type } from "arktype";
import { appConfig } from "./app-config";

export type AppConfig = typeof appConfig.AppConfig.infer;
type Page = typeof appConfig.Page.infer;
type NavigationItem = typeof appConfig.NavigationItem.infer;

const parseAppConfigJson = type("string.json.parse").to(appConfig.AppConfig);

function remapPageUrl(page: Page, configUrl: string) {
  const absoluteConfigUrl = new URL(configUrl, window.location.href);
  const newUrl = new URL(page.path, absoluteConfigUrl);

  const urlWithoutDomain = newUrl.pathname + newUrl.search + newUrl.hash;

  return {
    ...page,
    path: urlWithoutDomain,
  };
}

function remapNavigationItems(
  items: NavigationItem[],
  configUrl: string,
): NavigationItem[] {
  return items.map((item) => {
    if (item.type === "page") {
      return remapPageUrl(item, configUrl);
    } else if (item.type === "group") {
      return {
        ...item,
        children: item.children.map((child) => remapPageUrl(child, configUrl)),
      };
    }
    return item;
  });
}

async function fetchAppConfig(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch app config from ${url}`);
  }
  const body = await response.text();
  const out = parseAppConfigJson(body);

  if (out instanceof type.errors) {
    console.warn(`Failed to parse app config for URL ${url}:`, out);
    return null;
  }

  return {
    ...out,
    navigation: remapNavigationItems(out.navigation, url),
  };
}

export async function loadAppConfigs(urls: string[]) {
  const configs: Record<string, AppConfig> = {};

  const results = await Promise.all(urls.map(fetchAppConfig));

  for (let i = 0; i < urls.length; i++) {
    const config = results[i];
    if (config) {
      configs[urls[i]] = config;
    }
  }

  return configs;
}
