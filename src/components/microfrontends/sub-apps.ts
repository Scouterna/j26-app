/**
 * Per-sub-app navigation capabilities.
 *
 * A single generic `IframeRouter` serves every sub-app via the `/app/$`
 * catch-all, so behavior is varied by a registry keyed by the sub-app id (the
 * first path segment). Sub-apps default to a full `src` reload on external
 * navigation; only the ones listed here opt into an alternative.
 */
export type NavStrategy = "src-reload" | "client-side";

const NAV_STRATEGY: Record<string, NavStrategy> = {
  // Booking is a Lustre SPA that mirrors its route to the shell and handles
  // popstate itself, so the shell can let native history drive it without a
  // reload. See docs/plans/07 in the j26-booking repo.
  booking: "client-side",
};

/** Sub-app id from an IframeRouter `path` prop, e.g. "./booking/activities" → "booking". */
export function subAppIdFromPath(path: string): string {
  return path.replace(/^\.?\//, "").split("/")[0] ?? "";
}

/**
 * Sub-app id from a full/absolute URL, e.g.
 * "https://host/_services/booking/activities/" → "booking"
 * "https://host/app/booking/activities" → "booking"
 * (the first segment is the routing prefix, `_services` or `app`).
 */
export function subAppIdFromUrl(url: string): string {
  const { pathname } = new URL(url, window.location.origin);
  return pathname.split("/").filter(Boolean)[1] ?? "";
}

export function navStrategyFor(path: string): NavStrategy {
  return NAV_STRATEGY[subAppIdFromPath(path)] ?? "src-reload";
}
