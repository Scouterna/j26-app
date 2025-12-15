import { createContext, use, useContext } from "react";
import { type AppConfig, loadAppConfigs } from "./dynamic-routes";

type DynamicRoutesContext = {
  configs: Record<string, AppConfig>;
  bottomNavItems: string[];
};

const context = createContext<DynamicRoutesContext | null>(null);

const appConfigUrls = ((import.meta.env.VITE_APP_CONFIGS ?? "") as string)
  .split(",")
  .map((item) => item.trim());

const bottomNavItems = ((import.meta.env.VITE_BOTTOM_NAV_ITEMS ?? "") as string)
  .split(",")
  .map((item) => item.trim());

const appConfigsPromise = loadAppConfigs(appConfigUrls);

export function DynamicRoutesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <context.Provider
      value={{
        configs: use(appConfigsPromise),
        bottomNavItems,
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
