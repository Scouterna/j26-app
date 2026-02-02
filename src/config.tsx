type Config = {
  tolgeeApiUrl: string;
  tolgeeApiKey: string;
  tolgeeProjectId: string;
  tolgeeBackendFetchPrefix: string;
  appConfigs: string[];
  bottomNavItems: string[];
  notificationsTenant: string;
  strapiApiUrl: string;
  strapiApiKey: string;
  strapiLocales: string[];
};

function parseConfigArray(configString: string): string[] {
  return configString
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function loadConfig(): Promise<Config> {
  const res = await fetch("/api/config");
  const data = await res.json();

  return {
    ...data,
    appConfigs: parseConfigArray(data.appConfigs),
    bottomNavItems: parseConfigArray(data.bottomNavItems),
    strapiLocales: parseConfigArray(data.strapiLocales),
  };
}

export const configPromise = loadConfig();
