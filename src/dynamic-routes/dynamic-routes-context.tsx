import { createContext, use, useContext, useMemo } from "react";
import { configPromise } from "../config";
import { type AppConfig, loadAppConfigs, type Page } from "./dynamic-routes";

type DynamicRoutesContext = {
  configs: Record<string, AppConfig>;
  bottomNavItems: string[];
  allPages: Page[];
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
  const configs = use(appConfigsPromise);
  const bottomNavItems = use(configPromise).bottomNavItems;

  const allPages = useMemo(() => {
    return Object.values(configs).flatMap((config) =>
      config.navigation.flatMap((navItem) => {
        if (navItem.type === "group") {
          return navItem.children;
        }
        return navItem;
      }),
    );
  }, [configs]);

  return (
    <context.Provider
      value={{
        configs,
        bottomNavItems,
        allPages,
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
