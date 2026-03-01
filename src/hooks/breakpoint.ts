import { useWindowSize } from "@uidotdev/usehooks";

export function useIsDesktop() {
  const windowSize = useWindowSize();
  const width = windowSize.width ?? globalThis.innerWidth;

  return width >= 900;
}
