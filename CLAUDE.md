# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm run dev          # Start dev server (Vite)

# Build
pnpm run build        # Full production build

# Lint & Format (Biome)
pnpm run lint         # Check linting
pnpm run format       # Check formatting
pnpm run biome check  # Lint + format check
pnpm run biome check --write  # Auto-fix

# Type checking
pnpm run typecheck    # Run tsc --noEmit
```

There are no tests in this project.

## Architecture

This is a **micro-frontend shell app** for the Jamboree26 event platform. It wraps sub-apps in iframes and provides shared UI (navigation, auth, i18n, notifications).

### Sub-App Integration

Sub-apps are served at `/_services/<appname>` in production. The shell navigates to them via the catch-all route `src/routes/_app/app.$.tsx`, which renders `IframeRouter` (`src/components/microfrontends/IframeRouter.tsx`). The iframe URL is derived from the current path by rewriting `/app/<appname>/...` → `/_services/<appname>/...`. URL changes inside the iframe are synced back to the shell via the `onLoad` event.

### Dynamic Route Configuration

Navigation items are not hardcoded — they are loaded at runtime from URLs listed in the `J26_PUBLIC_APP_CONFIGS` env var. Each config URL returns a JSON object validated with ArkType schemas (`src/dynamic-routes/app-config.ts`). Configs are parsed and merged in `src/dynamic-routes/dynamic-routes.ts`, then provided via React context (`src/dynamic-routes/dynamic-routes-context.tsx`). Bottom nav items are filtered to the IDs listed in `J26_PUBLIC_BOTTOM_NAV_ITEMS`.

### Runtime Config

The frontend fetches `/config.json` on startup (`src/config.tsx`) and makes the config available globally. In dev, the `runtimeConfigPlugin` in `vite.config.ts` serves this from `J26_PUBLIC_*` env vars. In production, `docker/entrypoint.sh` generates the file before nginx starts.

### Authentication

Auth is handled by an external service proxied at `/auth/**`. User data is fetched from `/auth/user`. Login/logout URLs are constructed in `src/auth/auth.ts` with redirect URIs and locale. The cookie `j26-auth_expires-at` signals auth state.

### State Management

- **Jotai atoms** for client state: user, language, onboarding status, side menu
- **React Query** for server state (notifications API)
- **React Context** for dynamic routes config and icon loading

### Internationalization

Tolgee (`src/tolgee.tsx`) with backend fetch. Two namespaces: `app` (UI strings) and `navigation` (menu labels). Supported languages: `sv`, `en`, `uk`.

### Tech Stack

| Concern | Tool |
|---------|------|
| Routing | TanStack Router (file-based, `src/routes/`) |
| State | Jotai + React Query |
| UI | `@scouterna/ui-react` Web Component wrappers |
| Styling | TailwindCSS with `@scouterna/tailwind-theme` |
| Icons | Tabler Icons (dynamically imported, `src/icons/icons.tsx`) |
| Validation | ArkType |
| HTTP | `openapi-fetch` |
| Build | Vite + Rolldown |
| Lint/Format | Biome |

### Key Environment Variables

All runtime config vars use the `J26_PUBLIC_` prefix (e.g. `J26_PUBLIC_APP_CONFIGS`). The prefix is stripped and the remainder converted to camelCase when served as `/config.json`.

```
J26_PUBLIC_APP_CONFIGS                    # Comma-separated URLs to app config JSONs
J26_PUBLIC_BOTTOM_NAV_ITEMS               # Comma-separated page IDs for bottom nav
J26_PUBLIC_TOLGEE_BACKEND_FETCH_PREFIX    # Translation CDN prefix
J26_PUBLIC_NOTIFICATIONS_TENANT           # Notifications service tenant
J26_PUBLIC_DEV_BANNER_MESSAGE             # Optional dev mode banner text
J26_PUBLIC_TOLGEE_API_URL                 # Tolgee API URL (dev only)
J26_PUBLIC_TOLGEE_API_KEY                 # Tolgee API key (dev only)
J26_PUBLIC_TOLGEE_PROJECT_ID              # Tolgee project ID (dev only)
J26_PUBLIC_ADDITIONAL_ROOT_PATHS          # Comma-separated extra root paths
J26_PUBLIC_PAYLOAD_API_URL                # Payload CMS API URL
J26_PUBLIC_PAYLOAD_LOCALES                # Comma-separated supported locales
```

In dev, these are read from `.env` by the `runtimeConfigPlugin` in `vite.config.ts` and served at `/config.json`. In production, `docker/entrypoint.sh` uses `jq` to write `/config.json` from the container environment before nginx starts.
