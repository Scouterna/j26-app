import { useNavigate } from "@tanstack/react-router";
import type { SyntheticEvent } from "react";

export type Props = {
  route: string;
  baseUrl: string;
  path: string;
  name: string;
};

export function IframeRouter({ route, baseUrl, path, name }: Props) {
  const navigate = useNavigate();

  const url = new URL(path, new URL(baseUrl, window.location.href)).toString();

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
      src={url}
      title={name}
      style={{ width: "100%", height: "100%", border: "none" }}
      onLoad={onIframeLoad}
    />
  );
}
