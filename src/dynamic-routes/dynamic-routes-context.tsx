import { createContext, use, useContext } from "react";
import { type AppConfig, loadAppConfigs } from "./dynamic-routes";

const context = createContext<Record<string, AppConfig> | null>(null);

const appConfigUrls = (import.meta.env.VITE_APP_APP_CONFIGS ?? "").split(",");
const appConfigsPromise = loadAppConfigs(appConfigUrls);

export function DynamicRoutesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const appConfigs = use(appConfigsPromise);

  return <context.Provider value={appConfigs}>{children}</context.Provider>;
}

export function useDynamicRoutes() {
  return useContext(context);
}
