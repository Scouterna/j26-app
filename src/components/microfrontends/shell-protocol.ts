/**
 * Shell Protocol — postMessage API for sub-apps
 *
 * Sub-apps (iframes served from /_services/<app>) can control parts of the
 * shell UI by posting messages to the parent window:
 *
 *   window.parent.postMessage({ type: "j26:appBar", ... }, window.location.origin)
 *
 * The shell may post messages back to notify the sub-app of user interactions.
 */

/**
 * Update the shell app bar.
 */
export type AppBarMessage = {
  type: "j26:appBar";
  /** Page title displayed in the app bar. */
  title?: string;
};

/**
 * Notify the shell of a client-side navigation (pushState / replaceState / popstate).
 * The sub-app should emit this whenever its URL changes without a full page load.
 */
export type NavigateMessage = {
  type: "j26:navigate";
  /** Absolute URL the sub-app navigated to. */
  url: string;
};

/** All messages a sub-app can post to the shell. */
export type IframeToShellMessage = AppBarMessage | NavigateMessage;
