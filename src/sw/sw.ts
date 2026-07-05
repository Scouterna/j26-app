import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { Route, registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

import { ExpirationPlugin } from "workbox-expiration";
import { resolveLink } from "../notifications/resolve-link";
import { showLocalizedNotification } from "../notifications/show-notification";
import { osmTilesRoute } from "./sw-osm-tiles";

const FIREBASE_CONFIG = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);

const firebaseApp = initializeApp(FIREBASE_CONFIG);
const messaging = getMessaging(firebaseApp);

onBackgroundMessage(messaging, async (payload) => {
  console.log("Background message received:", payload);
  const raw = payload.data?.payload;
  if (!raw) {
    console.error("Background message missing data.payload", payload);
    return;
  }

  await showLocalizedNotification(self.registration, raw).catch((e) =>
    console.error("Failed to show notification:", e),
  );
});

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  let link = resolveLink(event.notification.data?.link ?? null);
  if (!link) {
    console.warn("Notification click with no valid link. Linking to homepage.");
  }

  link ??= "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => "focus" in c);
        if (existing) {
          existing.navigate(link);
          return existing.focus();
        }
        return self.clients.openWindow(link);
      }),
  );
});

// clients.claim() makes the new SW take control of open pages immediately,
// which fires controllerchange and lets vite-plugin-pwa trigger a page reload.
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

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
      fetchOptions: { cache: "no-store" },
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
      fetchOptions: { cache: "no-store" },
      plugins: [new CacheableResponsePlugin({ statuses: [200] })],
    }),
  ),
);

// Cache translations with NetworkFirst so updates on the CDN are picked up on
// the next load without requiring a SW update. Falls back to cache after 3s so
// the app stays usable in low-reception environments.
registerRoute(
  new Route(
    ({ url }) => url.hostname === "j26-translations.jamboree.se",
    new NetworkFirst({
      cacheName: "translations",
      networkTimeoutSeconds: 5,
      fetchOptions: { cache: "no-store" },
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
