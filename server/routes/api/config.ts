import { defineHandler } from "nitro/h3";
import { useRuntimeConfig } from "nitro/runtime-config";

export default defineHandler(() => {
  const config = useRuntimeConfig();

  const publicConfig: Record<string, unknown> = {};

  for (const key in config) {
    if (key.match(/^public[A-Z]/)) {
      const newKey = key.charAt(6).toLowerCase() + key.slice(7);
      publicConfig[newKey] = config[key];
    }
  }

  return publicConfig;
});
