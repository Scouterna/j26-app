type Config = {
  tolgeeApiUrl: string;
  tolgeeApiKey: string;
  tolgeeProjectId: string;
  tolgeeBackendFetchPrefix: string;
  appConfigs: string[];
  bottomNavItems: string[];
  additionalRootPaths: string[];
  notificationsTenant: string;
  devBannerMessage?: string | null;
  payloadApiUrl: string;
  payloadLocales: string[];
};

function parseConfigArray(configString: string): string[] {
  return configString
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function loadConfig(): Promise<Config> {
  const res = await fetch("/config.json");
  const data = await res.json();

  return {
    ...data,
    appConfigs: parseConfigArray(data.appConfigs),
    bottomNavItems: parseConfigArray(data.bottomNavItems),
    additionalRootPaths: parseConfigArray(data.additionalRootPaths),
    payloadLocales: parseConfigArray(data.payloadLocales),
  };
}

export const configPromise = loadConfig();
