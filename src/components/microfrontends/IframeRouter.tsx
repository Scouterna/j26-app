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
      src={url}
      title={name}
      style={{ width: "100%", height: "100%", border: "none" }}
      onLoad={onIframeLoad}
    />
  );
}
