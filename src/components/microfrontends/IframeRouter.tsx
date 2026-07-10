import { useNavigate } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { type SyntheticEvent, useEffect, useRef } from "react";
import { iframeAppBarAtom } from "./iframeAppBarAtom";
import type { IframeToShellMessage } from "./shell-protocol";
import { navStrategyFor, subAppIdFromUrl } from "./sub-apps";

export type Props = {
  route: string;
  baseUrl: string;
  path: string;
  name: string;
};

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
  // shell nav link), reconcile the iframe. Skip when the change was triggered by
  // the iframe itself to avoid the double-load feedback loop.
  useEffect(() => {
    if (iframeInitiatedUrl.current === url) {
      iframeInitiatedUrl.current = null;
      return;
    }

    let sameSubApp = false;
    try {
      const win = iframeRef.current?.contentWindow;
      sameSubApp =
        !!win && subAppIdFromUrl(win.location.href) === subAppIdFromUrl(url);
    } catch {
      // Cross-origin iframe: can't inspect it, treat as a cold switch.
      sameSubApp = false;
    }

    // A client-side sub-app (e.g. booking) mirrors its own route and handles
    // popstate itself. A same-sub-app external navigation (back/forward/nav
    // link) is already applied by the browser's native history traversal, which
    // fires popstate inside the same-origin iframe and re-renders it with no
    // reload. Reassigning src here would cold-reload the SPA and drop its state.
    if (navStrategyFor(path) === "client-side" && sameSubApp) {
      return;
    }

    if (
      iframeRef.current &&
      iframeRef.current.contentWindow?.location.href !== url
    ) {
      iframeRef.current.src = url;
    }
  }, [url, path]);

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

    // Mirror client-side sub-app navigation with `replace` so the shell reuses
    // the single joint-history entry the iframe's own pushState already created,
    // rather than pushing a second (which would make back need two presses and
    // desync the shell URL from the iframe). Other sub-apps keep the default
    // push.
    navigate({
      to: route,
      params: {
        _splat: relativePath,
      },
      replace: navStrategyFor(path) === "client-side",
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
