import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { Route, registerRoute } from "workbox-routing";
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

import { ExpirationPlugin } from "workbox-expiration";

import { osmTilesRoute } from "./sw-osm-tiles";

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

// https://vite-pwa-org.netlify.app/guide/inject-manifest.html#prompt-for-update-behavior
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Cache /config.json with NetworkFirst so the app works offline with the last
// known config, but always gets a fresh copy when online.
registerRoute(
  new Route(
    ({ url }) => url.pathname === "/config.json",
    new NetworkFirst({
      cacheName: "runtime-config",
      plugins: [new CacheableResponsePlugin({ statuses: [200] })],
    }),
  ),
);

// Cache sub-app config files with NetworkFirst — they are as dynamic as
// /config.json and must be fresh when online.
registerRoute(
  new Route(
    ({ url }) => /^\/_services\/[^/]+\/app-config\.json$/.test(url.pathname),
    new NetworkFirst({
      cacheName: "app-configs",
      plugins: [new CacheableResponsePlugin({ statuses: [200] })],
    }),
  ),
);

// Cache translations with StaleWhileRevalidate: serve from cache immediately
// for fast loads, refresh in the background so the next visit gets fresh strings.
registerRoute(
  new Route(
    ({ url }) => url.hostname === "j26-translations.jamboree.se",
    new StaleWhileRevalidate({
      cacheName: "translations",
      plugins: [new CacheableResponsePlugin({ statuses: [200] })],
    }),
  ),
);

// OSM tile blocking — see sw-osm-tiles.ts for the polygon and handler logic.
registerRoute(osmTilesRoute);

// Aggressively cache all Tabler icons from jsDelivr, since they are versioned
// and thus safe to cache for a long time. This is needed to make the icons work
// offline, since they are imported dynamically in the app.
registerRoute(
  new Route(
    ({ url }) => {
      return url.href.startsWith("https://cdn.jsdelivr.net/npm/@tabler/icons@");
    },
    new CacheFirst({
      cacheName: "tabler-icons",
      plugins: [
        new ExpirationPlugin({
          maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days - the version is included in the URL so this is safe
        }),
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    }),
  ),
);
