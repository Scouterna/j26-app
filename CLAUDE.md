# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun dev              # Start dev server (Vite + Nitro)

# Build
bun run build        # Full production build

# Lint & Format (Biome)
bun run lint         # Check linting
bun run format       # Check formatting
bun run biome check  # Lint + format check
bun run biome check --write  # Auto-fix

# Type checking
bun run typecheck    # Run tsc --noEmit
```

There are no tests in this project.

## Architecture

This is a **micro-frontend shell app** for the Jamboree26 event platform. It wraps sub-apps in iframes and provides shared UI (navigation, auth, i18n, notifications).

### Sub-App Integration

Sub-apps are served at `/_services/<appname>` in production. The shell navigates to them via the catch-all route `src/routes/_app/app.$.tsx`, which renders `IframeRouter` (`src/components/microfrontends/IframeRouter.tsx`). The iframe URL is derived from the current path by rewriting `/app/<appname>/...` → `/_services/<appname>/...`. URL changes inside the iframe are synced back to the shell via the `onLoad` event.

### Dynamic Route Configuration

Navigation items are not hardcoded — they are loaded at runtime from URLs listed in the `NITRO_PUBLIC_APP_CONFIGS` env var. Each config URL returns a JSON object validated with ArkType schemas (`src/dynamic-routes/app-config.ts`). Configs are parsed and merged in `src/dynamic-routes/dynamic-routes.ts`, then provided via React context (`src/dynamic-routes/dynamic-routes-context.tsx`). Bottom nav items are filtered to the IDs listed in `NITRO_PUBLIC_BOTTOM_NAV_ITEMS`.

### Runtime Config

The Nitro server exposes a `/api/config` endpoint (`server/routes/api/config.ts`) that reads `NITRO_PUBLIC_*` environment variables and returns them as JSON. The frontend loads this on startup (`src/config.tsx`) and makes the config available globally.

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
| Build | Vite + Rolldown + Nitro |
| Lint/Format | Biome |

### Key Environment Variables

```
NITRO_PUBLIC_APP_CONFIGS               # Comma-separated URLs to app config JSONs
NITRO_PUBLIC_BOTTOM_NAV_ITEMS          # Comma-separated page IDs for bottom nav
NITRO_PUBLIC_TOLGEE_BACKEND_FETCH_PREFIX  # Translation CDN prefix
NITRO_PUBLIC_NOTIFICATIONS_TENANT      # Notifications service tenant
NITRO_PUBLIC_DEV_BANNER_MESSAGE        # Optional dev mode banner text
```

Dev proxies (defined in `vite.config.ts`) forward `/auth/**`, `/notifications/**`, and `/_services/signupinfo/**` to `https://app.dev.j26.se/`.
