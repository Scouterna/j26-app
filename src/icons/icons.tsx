import HelpSquareIcon from "@tabler/icons/outline/help-square.svg?raw";
import { createContext, use } from "react";

type IconMap = Map<string, Promise<string>>;

const context = createContext<IconMap | null>(null);

export function IconProvider({ children }: { children: React.ReactNode }) {
  return <context.Provider value={new Map()}>{children}</context.Provider>;
}

export function useIcon(
  iconName: string | null | undefined,
  variant: "outline" | "filled" = "outline",
) {
  if (!iconName) {
    return undefined;
  }

  const iconMap = use(context);
  if (!iconMap) {
    throw new Error("useIcon must be used within an IconProvider");
  }

  if (!iconMap.has(iconName)) {
    const url = `/icons/${variant}/${iconName}.svg`;

    const promise = fetch(url)
      .then(async (res) => {
        const text = await res.text();
        if (!text.includes("<svg")) {
          throw new Error(`Content did not look like an SVG for URL ${url}`);
        }
        return text;
      })
      .catch(() => {
        console.warn(`Failed to load icon: ${iconName}`);
        return HelpSquareIcon;
      });

    iconMap.set(iconName, promise);
  }

  // biome-ignore lint/style/noNonNullAssertion: We just set it if it was missing
  return use(iconMap.get(iconName)!);
}
