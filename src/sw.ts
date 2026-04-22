import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { Route, registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

import { ExpirationPlugin } from "workbox-expiration";

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

// https://vite-pwa-org.netlify.app/guide/inject-manifest.html#prompt-for-update-behavior
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

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
