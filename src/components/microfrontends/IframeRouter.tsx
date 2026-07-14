import { useNavigate } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { type SyntheticEvent, useEffect, useRef } from "react";
import { iframeAppBarAtom } from "./iframeAppBarAtom";
import type { IframeToShellMessage } from "./shell-protocol";

export type Props = {
  route: string;
  baseUrl: string;
  path: string;
  name: string;
};

/**
 * Extract the sub-app segment from a URL living under `baseUrl`
 * (e.g. "booking" from "/_services/booking/activities"). Returns null when the
 * URL is not under the base path. Used to decide whether a shell-driven
 * navigation stays within the same sub-app (client-side nav) or crosses into a
 * different one (full reload).
 */
function subAppSegment(absoluteUrl: string, baseUrl: string): string | null {
  const base = new URL(baseUrl, window.location.origin).pathname;
  const { pathname } = new URL(absoluteUrl, window.location.origin);
  if (!pathname.startsWith(base)) return null;
  return pathname.slice(base.length).split("/")[0] || null;
}

export function IframeRouter({ route, baseUrl, path, name }: Props) {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const setIframeAppBar = useSetAtom(iframeAppBarAtom);

  let url = new URL(path, new URL(baseUrl, window.location.href)).toString();

  // Ensure trailing slash so that relative assets load correctly
  url = url.replace(/\/*$/, "/");

  // Keep a stable initial URL for the src prop so React never updates the DOM
  // attribute (which would reload the iframe). External navigation is handled
  // imperatively below.
  const initialUrl = useRef(url);

  // Tracks the URL that the iframe last reported via onLoad. When the shell URL
  // changes to exactly this value, the change was iframe-initiated and we must
  // not push it back (which would cause a double-load). Pre-populated with the
  // initial URL so the mount-time effect run is treated as a no-op.
  const iframeInitiatedUrl = useRef<string | null>(url);

  // When the shell URL changes due to external navigation (e.g. browser back,
  // shell nav link), push the new URL into the iframe. Skip when the change was
  // triggered by the iframe itself to avoid the double-load feedback loop.
  useEffect(() => {
    if (iframeInitiatedUrl.current === url) {
      iframeInitiatedUrl.current = null;
      return;
    }

    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const win = iframe.contentWindow;
      // Reading location.href throws for cross-origin frames. Sub-apps are
      // same-origin, so a throw means something unexpected — fall back to src.
      const currentHref = win?.location.href;

      if (!win || currentHref === undefined) {
        iframe.src = url;
        return;
      }

      // Already there (e.g. an iframe-initiated change that round-tripped).
      if (currentHref === url) return;

      // Navigate client-side only when staying within the same sub-app. A
      // different sub-app is a different bundle, so a real load is correct.
      const currentApp = subAppSegment(currentHref, baseUrl);
      const targetApp = subAppSegment(url, baseUrl);

      if (currentApp !== null && currentApp === targetApp) {
        // Align the iframe's URL and dispatch a popstate. Sub-app routers
        // already handle the browser back button, i.e. they listen for
        // popstate and re-read location — so this drives a client-side
        // navigation with no reload. The popstate carries the fresh history
        // state for routers that inspect it.
        //
        // replaceState (not pushState): the shell owns the browser history via
        // its own router; it has already created/moved the entry for this
        // navigation. The iframe only mirrors that entry, so it must not add a
        // parallel one — pushing here would double history entries and, when
        // this runs in response to a back press, clobber the forward stack.
        win.history.replaceState({}, "", url);
        win.dispatchEvent(
          new PopStateEvent("popstate", { state: win.history.state }),
        );
      } else {
        iframe.src = url;
      }
    } catch {
      // SecurityError (cross-origin) or any unexpected failure: reload.
      iframe.src = url;
    }
  }, [url, baseUrl]);

  const syncIframeUrl = (newUrl: string) => {
    const absoluteUrl = new URL(newUrl, window.location.origin).toString();
    const relativePath = absoluteUrl.replace(
      new URL(baseUrl, window.location.origin).toString(),
      "",
    );

    // Compute the normalised URL that navigate() will produce so the effect
    // can recognise the resulting shell URL change as iframe-initiated.
    let expectedUrl = new URL(
      `./${relativePath}`,
      new URL(baseUrl, window.location.href),
    ).toString();
    expectedUrl = expectedUrl.replace(/\/*$/, "/");
    iframeInitiatedUrl.current = expectedUrl;

    navigate({
      to: route,
      params: {
        _splat: relativePath,
      },
    });
  };

  // Ref so the effect always calls the latest closure without re-registering.
  const syncIframeUrlRef = useRef(syncIframeUrl);
  syncIframeUrlRef.current = syncIframeUrl;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;

      const message = event.data as IframeToShellMessage;

      if (message.type === "j26:appBar") {
        setIframeAppBar({ title: message.title });
      }

      if (message.type === "j26:navigate") {
        syncIframeUrlRef.current(message.url);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setIframeAppBar]);

  // Reset app bar state when this iframe unmounts (e.g. navigating away)
  useEffect(() => {
    return () => setIframeAppBar(null);
  }, [setIframeAppBar]);

  const onIframeLoad = (event: SyntheticEvent<HTMLIFrameElement>) => {
    const newUrl = event.currentTarget.contentWindow?.location.href;
    if (!newUrl) {
      console.warn("Could not get iframe URL");
      return;
    }
    syncIframeUrl(newUrl);
  };

  return (
    <iframe
      ref={iframeRef}
      src={initialUrl.current}
      title={name}
      style={{ width: "100%", height: "100%", border: "none" }}
      onLoad={onIframeLoad}
    />
  );
}
