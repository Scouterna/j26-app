import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging/sw";
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
import { resolveLink } from "../notifications/resolve-link";
import { mapPmtilesRoute } from "./sw-map-pmtiles";

const FIREBASE_CONFIG = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);

const firebaseApp = initializeApp(FIREBASE_CONFIG);

// Calling getMessaging() registers Firebase's own push/notificationclick
// listeners, which auto-display and auto-handle clicks for background
// messages (using the FCM message's own notification/webpush/fcmOptions
// fields) without us calling showNotification ourselves — doing so here too
// would show every background notification twice. We only need our own
// showNotification call for foreground messages (see __root.tsx), since FCM
// deliberately never auto-displays while a tab is visible. Our
// notificationclick listener below only fires for those foreground-shown
// notifications: Firebase's own listener (registered first, right here)
// stops propagation for the ones it auto-displayed.
getMessaging(firebaseApp);

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

// Runtime caches that hold per-user responses and must be dropped when the
// signed-in identity changes (login / logout / account switch), so one user
// never sees another's cached data offline on a shared device. subapp-api holds
// per-user API reads (notifications, "me", etc.); the SSR sub-app entry
// documents (booking, platsbank) are rendered per-user too. The app posts
// CLEAR_USER_CACHES when it detects an identity change (see auth.ts).
const USER_SPECIFIC_CACHES = ["subapp-api", "subapp-entrypoints"];

// https://vite-pwa-org.netlify.app/guide/inject-manifest.html#prompt-for-update-behavior
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data && event.data.type === "CLEAR_USER_CACHES") {
    event.waitUntil(
      Promise.all(USER_SPECIFIC_CACHES.map((name) => caches.delete(name))),
    );
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
    ({ url }) =>
      url.pathname === "/app-config.json" ||
      /^\/_services\/[^/]+\/app-config\.json$/.test(url.pathname),
    new NetworkFirst({
      cacheName: "app-configs",
      fetchOptions: { cache: "no-store" },
      plugins: [new CacheableResponsePlugin({ statuses: [200] })],
    }),
  ),
);

// Sub-app entry documents: navigation requests under /_services/* are the
// navigable entrypoints (top-level and iframe document loads, e.g.
// /_services/map), never hashed assets or subresource fetches. Serve these
// NetworkFirst with cache: "no-store" so a sub-app deploy is picked up
// immediately, bypassing any stale browser-heuristic cache of the entry HTML.
// Falls back to cache when offline.
//
// The CMS admin (/_services/cms) is deliberately excluded: it's an online-only
// editing tool (it needs the DB), so its entry document must never be cached —
// only its content API and uploads under /_services/cms/api are (see below).
registerRoute(
  new Route(
    ({ url, request }) =>
      request.mode === "navigate" &&
      url.pathname.startsWith("/_services/") &&
      !/^\/_services\/cms(\/|$)/.test(url.pathname),
    new NetworkFirst({
      cacheName: "subapp-entrypoints",
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

// Cache the map sub-app's self-hosted Tabler marker icons
// (/_services/<subapp>/tabler/<variant>/<name>.svg). Unlike the jsDelivr URLs
// above, these paths are NOT versioned, so StaleWhileRevalidate is used instead
// of CacheFirst: icons render instantly from cache (and work offline), while a
// background revalidation picks up any change on the next load.
registerRoute(
  new Route(
    ({ url }) => /^\/_services\/[^/]+\/tabler\//.test(url.pathname),
    new StaleWhileRevalidate({
      cacheName: "subapp-tabler-icons",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 500,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        }),
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    }),
  ),
);

// ---------------------------------------------------------------------------
// Sub-app offline caching
//
// Sub-apps are deployed independently and served same-origin under
// /_services/<app>/, so the shell can only cache them at runtime (it can't
// precache assets whose hashed names it doesn't know at its own build time).
// Each rule below therefore populates on the first online visit to a sub-app,
// after which that sub-app works offline. Ordering matters: Workbox matches
// routes in registration order (first match wins), so more specific routes are
// registered before the broad /assets/ catch-all.
// ---------------------------------------------------------------------------

// Map basemap: single bundled PMTiles file served with HTTP Range requests.
// Custom handler (see sw-map-pmtiles.ts) caches the full file and slices ranges
// from it. MUST be registered before the generic /assets/ rule so it wins over
// it (the .pmtiles lives under /_services/map/assets/).
registerRoute(mapPmtilesRoute);

// Map glyphs (label fonts): /_services/map/fonts/<fontstack>/<range>.pbf.
// Required for any map text to render offline. These paths are NOT
// content-hashed, so — like the other non-versioned map assets below —
// StaleWhileRevalidate rather than CacheFirst: instant offline render while a
// background revalidation picks up updated glyphs on the next load, instead of
// pinning a stale copy for the whole expiry window.
registerRoute(
  new Route(
    ({ url }) => /^\/_services\/map\/fonts\//.test(url.pathname),
    new StaleWhileRevalidate({
      cacheName: "map-glyphs",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 64,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        }),
        new CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
  ),
);

// Map's other self-hosted, non-hashed static assets: marker/logo/symbol SVGs
// (/_services/map/{logos,symbols,icons}/*.svg) and its data JSON at the app
// root (logos.json, scout-groups.json). Non-versioned names → StaleWhileRevalidate
// so they render instantly offline while updating in the background.
registerRoute(
  new Route(
    ({ url }) =>
      /^\/_services\/map\/(logos|symbols|icons)\//.test(url.pathname) ||
      /^\/_services\/map\/[^/]+\.json$/.test(url.pathname),
    new StaleWhileRevalidate({
      cacheName: "map-static",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        }),
        new CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
  ),
);

// Hashed sub-app assets under /_services/<app>/assets/*. These sub-apps build
// with Vite defaults, which content-hash every file emitted here (JS, CSS,
// fonts, images, GeoJSON, …) — verified against their build output and configs.
// The hash makes them immutable, so CacheFirst is safe: a redeploy changes the
// hash (a new URL, fetched fresh) and old entries age out via the expiry.
//
// The app list is an explicit allowlist rather than a /_services/<app>/ wildcard
// ON PURPOSE: CacheFirst on a NON-hashed URL would pin stale content for the
// full expiry window, so we only opt in apps whose /assets/ is confirmed fully
// hashed. A new sub-app must be vetted and added here; until then its assets
// simply aren't offline-cached (a safe default) rather than risking a stale pin.
// Note: booking is deliberately absent — its bundle uses stable (non-hashed)
// names under /static/ and is handled by the StaleWhileRevalidate rule below.
// The map's .pmtiles is handled by the route above and never reaches here.
registerRoute(
  new Route(
    ({ url }) =>
      /^\/_services\/(map|platsbank|signupinfo|interactive-screens)\/assets\//.test(
        url.pathname,
      ),
    new CacheFirst({
      cacheName: "subapp-assets",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 500,
          maxAgeSeconds: 60 * 60 * 24 * 60, // 60 days
        }),
        new CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
  ),
);

// Booking sub-app bundle: /_services/booking/static/* (client.js, client.css).
// Unlike the Vite apps, booking's Gleam/Lustre build emits STABLE, non-hashed
// filenames, so CacheFirst would pin a stale bundle forever. StaleWhileRevalidate
// serves instantly offline and picks up a new deploy on the next load.
registerRoute(
  new Route(
    ({ url }) => /^\/_services\/booking\/static\//.test(url.pathname),
    new StaleWhileRevalidate({
      cacheName: "booking-static",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 32,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        }),
        new CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
  ),
);

// Sub-app read APIs (GET only — Workbox routes match GET by default, so POST/
// PUT/DELETE mutations correctly bypass the cache and remain online-only).
// NetworkFirst so data is fresh online but the last-known response renders when
// offline. Covers booking/signupinfo/notifications REST under /api/ and
// platsbank's TanStack server-function reads under /_serverFn/. The
// interactive-screens API is intentionally excluded: it is a real-time app that
// is meaningless from cache. Notifications responses carry Cache-Control:
// no-store, but Workbox's Cache Storage writes are not governed by that header,
// so they still cache; the response body is user-specific, hence a short expiry.
registerRoute(
  new Route(
    ({ url }) =>
      /^\/_services\/(booking|signupinfo|notifications)\/api\//.test(
        url.pathname,
      ) || /^\/_services\/platsbank\/_serverFn\//.test(url.pathname),
    new NetworkFirst({
      cacheName: "subapp-api",
      networkTimeoutSeconds: 5,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        }),
        new CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
  ),
);

// Payload CMS media (images/uploads) at /_services/cms/api/media/*. In production the
// CMS is served same-origin under /_services/cms (Next.js basePath), so its API and
// uploads live under /_services/cms/api (dev points at a separate localhost port,
// which this intentionally doesn't match). NOTE: the admin UI itself lives under
// /_services/cms (navigation + /_services/cms/_next/*) and is deliberately NOT matched by any
// route here — it must stay network-only, never cached. Filenames are derived
// from the upload name (stable while the file exists, but not content-hashed), so
// StaleWhileRevalidate rather than CacheFirst: instant offline render, background
// refresh if an image is re-uploaded. Registered before the CMS content rule so
// media doesn't fall through to NetworkFirst.
registerRoute(
  new Route(
    ({ url }) =>
      url.origin === self.location.origin &&
      url.pathname.startsWith("/_services/cms/api/media/"),
    new StaleWhileRevalidate({
      cacheName: "cms-media",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 300,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        }),
        new CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
  ),
);

// Payload CMS content JSON (collections/globals the shell renders itself, e.g.
// info pages and important-info) under /_services/cms/api/*. Responses vary by
// ?locale= — the full URL (including query) is the cache key by default, so
// locales cache separately. NetworkFirst: fresh online, last-known content
// offline. Media is handled by the rule above (registered first). This matches
// only the CMS API subtree, not the admin app under /_services/cms itself.
registerRoute(
  new Route(
    ({ url }) =>
      url.origin === self.location.origin &&
      url.pathname.startsWith("/_services/cms/api/"),
    new NetworkFirst({
      cacheName: "cms-content",
      networkTimeoutSeconds: 5,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        }),
        new CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
  ),
);

// Scouterna UI web components loaded from jsDelivr by the booking sub-app. The
// URL is version-pinned (@scouterna/ui-webc@x.y.z), so it's safe to cache for a
// long time — same rationale as the @tabler/icons rule above.
registerRoute(
  new Route(
    ({ url }) =>
      url.href.startsWith("https://cdn.jsdelivr.net/npm/@scouterna/ui-webc@"),
    new CacheFirst({
      cacheName: "ui-webc",
      plugins: [
        new ExpirationPlugin({
          maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days (version is in the URL)
        }),
        new CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
  ),
);

// Google Fonts stylesheet (booking): small, may change → StaleWhileRevalidate.
registerRoute(
  new Route(
    ({ url }) => url.origin === "https://fonts.googleapis.com",
    new StaleWhileRevalidate({
      cacheName: "google-fonts-stylesheets",
      plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
    }),
  ),
);

// Google Fonts font files (booking): immutable, versioned URLs → CacheFirst.
registerRoute(
  new Route(
    ({ url }) => url.origin === "https://fonts.gstatic.com",
    new CacheFirst({
      cacheName: "google-fonts-webfonts",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 32,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
        }),
        new CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
  ),
);
