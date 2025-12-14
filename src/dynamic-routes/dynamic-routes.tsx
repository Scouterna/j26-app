import { type } from "arktype";
import { appConfig } from "./app-config";

export type AppConfig = typeof appConfig.AppConfig.infer;

const parseAppConfigJson = type("string.json.parse").to(appConfig.AppConfig);

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

  return out;
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
