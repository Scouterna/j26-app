import { type } from "arktype";
import { appConfig } from "./app-config";

export type AppConfig = typeof appConfig.AppConfig.infer;
export type Page = typeof appConfig.Page.infer;
export type NavigationItem = typeof appConfig.NavigationItem.infer;

const parseAppConfigJson = type("string.json.parse").to(appConfig.AppConfig);

function remapPageUrl(page: Page, configUrl: string) {
  const absoluteConfigUrl = new URL(configUrl, window.location.href);
  const newUrl = new URL(page.path, absoluteConfigUrl);

  let urlWithoutDomain = newUrl.pathname + newUrl.search + newUrl.hash;

  urlWithoutDomain = urlWithoutDomain.replace(/^\/_services\//, "/app/");

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
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Non-ok status code returned from app config: ${url}`);
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
  } catch (e) {
    throw new Error(`Error loading app config from ${url}: ${e}`);
  }
}

export async function loadAppConfigs(urls: string[]) {
  const configs: Record<string, AppConfig> = {};

  const results = await Promise.allSettled(urls.map(fetchAppConfig));

  for (let i = 0; i < urls.length; i++) {
    const result = results[i];

    if (result.status === "rejected") {
      console.error(
        `Failed to load app config from ${urls[i]}:`,
        result.reason,
      );
      continue;
    }

    const config = result.value;

    if (!config) {
      console.warn(`App config from ${urls[i]} is null, skipping.`);
      continue;
    }

    configs[urls[i]] = config;
  }

  return configs;
}
