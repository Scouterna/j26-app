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

/** All messages a sub-app can post to the shell. */
export type IframeToShellMessage = AppBarMessage;
