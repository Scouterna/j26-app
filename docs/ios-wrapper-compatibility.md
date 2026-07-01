# iOS App Store wrapper — compatibility notes

Notes on how this app behaves when wrapped for the iOS App Store via
[PWABuilder](https://www.pwabuilder.com/) (a native shell around a
`WKWebView` pointed at the hosted app). PWABuilder's iOS wrapper is
detected at runtime via a `PWAShell` user-agent token
(`src/native-app.ts`, `isIosPwa`).

## 1. Push notifications will not work as currently implemented

`src/notifications/firebase.ts` implements push via Firebase Cloud
Messaging's *web* push, which depends on the Push API
(`registration.pushManager.getSubscription()` /
`getToken(messaging, { serviceWorkerRegistration })`).

**`WKWebView` does not implement the Push API at all.** This isn't a
degraded case — the API is simply absent, so the existing
FCM-web-push flow cannot register a subscription inside the wrapper.

To get push notifications on the iOS App Store build, real native
APNs integration is needed (e.g. bundling the Firebase iOS SDK into
the Xcode project PWABuilder generates). PWABuilder does not provide
this automatically.

The codebase already anticipates this gap: `isNativeApp`
(`src/native-app.ts`) is used to skip the notifications-permission
onboarding step entirely for native-wrapped apps
(`src/routes/onboarding/signin.tsx:58`,
`src/routes/onboarding/finished.tsx:28`) — but there is currently no
replacement push mechanism wired up, so iOS App Store users get no
push notifications until one is added.

## 2. Auth login flow's cross-origin redirect is untested

The manifest (`vite.config.ts`) declares `scope_extensions` for
`dev.id.scouterna.se`, `id.scouterna.se`, and `j26.scoutid.se`. This
is an experimental, Chromium-only manifest field that lets an
*installed PWA* treat those origins as in-scope — Safari/WKWebView
ignores it entirely.

`/auth/login` (`src/auth/auth.ts`) redirects through the OIDC
provider on one of those external domains before returning. Inside
the PWABuilder wrapper, what happens to that cross-origin navigation
depends entirely on the wrapper's native navigation-policy code —
some WKWebView wrappers punt cross-origin navigation out to
Safari/`SFSafariViewController`, which can leave the resulting
`j26-auth_expires-at` cookie in a different cookie store than the
wrapped app uses.

**Action:** manually test the full login flow in an actual
PWABuilder-generated build to confirm the redirect-back and cookie
survive.

## 3. Geolocation needs an Info.plist entry

`src/routes/onboarding/location.tsx` calls
`navigator.geolocation.getCurrentPosition`. iOS requires
`NSLocationWhenInUseUsageDescription` in `Info.plist`, or the call
silently fails (and Apple will reject a build that uses the API
without it).

**Action:** confirm PWABuilder's generated project includes this key
— it is not automatic.

## 4. Offline map tile / Workbox caching — likely fine, but test under load

`src/sw/sw-osm-tiles.ts` caches OSM tiles with a 365-day expiration
via Workbox `CacheFirst`. WKWebView does support the Cache API and
service workers in PWABuilder's template, but iOS enforces stricter
per-origin storage quotas than desktop and can purge more
aggressively under storage pressure.

**Action:** stress-test offline map/venue caching at real event data
size, since offline access is core to the "no WiFi at camp" use
case.

## Not an issue

`InstallBanner.tsx`'s `beforeinstallprompt` listener never fires in
WKWebView, so the "install the app" banner stays collapsed (`height:
0`) inside the native wrapper — it just never triggers, so no
install-prompt UI leaks into the native app. Fine as-is, but worth a
quick manual check rather than assuming.

## Summary

| Area | Status | Action needed |
|---|---|---|
| Push notifications (FCM web push) | Broken in wrapper | Add native APNs integration |
| Auth login redirect (cross-origin) | Unverified | Manual test in real build |
| Geolocation | Needs Info.plist key | Verify `NSLocationWhenInUseUsageDescription` present |
| Offline map tile caching | Likely fine | Stress-test storage limits |
| Install banner | Not an issue | None |
