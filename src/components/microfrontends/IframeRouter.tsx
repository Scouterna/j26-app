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

    if (
      iframeRef.current &&
      iframeRef.current.contentWindow?.location.href !== url
    ) {
      iframeRef.current.src = url;
    }
  }, [url]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;

      const message = event.data as IframeToShellMessage;

      if (message.type === "j26:appBar") {
        setIframeAppBar({ title: message.title });
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

    const relativePath = newUrl.replace(
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
