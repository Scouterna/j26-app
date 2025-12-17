import { createContext, use, useContext } from "react";
import { type AppConfig, loadAppConfigs } from "./dynamic-routes";
import { configPromise } from "../config";

type DynamicRoutesContext = {
  configs: Record<string, AppConfig>;
  bottomNavItems: string[];
};

const context = createContext<DynamicRoutesContext | null>(null);

const appConfigsPromise = (async () => {
  const config = await configPromise;
  return await loadAppConfigs(config.appConfigs);
})();

export function DynamicRoutesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <context.Provider
      value={{
        configs: use(appConfigsPromise),
        bottomNavItems: use(configPromise).bottomNavItems,
      }}
    >
      {children}
    </context.Provider>
  );
}

export function useDynamicRoutes() {
  const ctx = useContext(context);
  if (!ctx) {
    throw new Error(
      "useDynamicRoutes must be used within a DynamicRoutesProvider",
    );
  }
  return ctx;
}
