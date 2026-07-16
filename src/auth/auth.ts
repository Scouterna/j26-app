import { type } from "arktype";
import { atom, useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";
import { languageAtom } from "../language/language";

const User = type({
  name: "string",
  preferredUsername: "string",
  givenName: "string",
  familyName: "string",
  email: "string",
});
type User = typeof User.infer;

const UserResponse = type({
  user: User,
});

const EXPIRES_AT_COOKIE_NAME = "j26-auth_expires-at";

function checkForExpiresAtCookie() {
  return document.cookie
    .split(";")
    .map((c) => c.trim())
    .some((c) => c.startsWith(`${EXPIRES_AT_COOKIE_NAME}=`));
}

async function getUser() {
  const response = await fetch("/auth/user", {
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const result = UserResponse(data);
  if (result instanceof type.errors) {
    console.error("Invalid user response:", result);
    return null;
  }

  return result.user;
}

export const userAtom = atom<User | null>(null);

const LAST_USER_KEY = "j26-last-user";

// Ask the service worker to drop per-user runtime caches (see the
// CLEAR_USER_CACHES handler in src/sw/sw.ts).
async function clearUserCaches() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage({ type: "CLEAR_USER_CACHES" });
  } catch (e) {
    console.error("Failed to request user cache clear:", e);
  }
}

// Detect when the signed-in identity changes between page loads — login, logout,
// or an account switch on a shared device — and clear cached per-user data so
// one user never sees another's notifications/schedule offline. Account changes
// always happen online (the auth flow needs the network), so the clear runs
// during that transition, before the new user can go offline. `null` means
// "not signed in". The identity is persisted in localStorage across loads.
function reconcileUserCaches(currentUserId: string | null) {
  const previous = localStorage.getItem(LAST_USER_KEY);
  const current = currentUserId ?? "";

  if (previous === current) {
    return;
  }

  // Only clear when there was a previous identity to leave behind; the very
  // first sign-in (no previous value) has nothing cached to leak.
  if (previous !== null) {
    void clearUserCaches();
  }

  localStorage.setItem(LAST_USER_KEY, current);
}

export const UserLoader = () => {
  const hasExpiresAtCookie = checkForExpiresAtCookie();
  const [user, setUser] = useAtom(userAtom);

  useEffect(() => {
    if (!hasExpiresAtCookie) {
      return;
    }

    if (user) {
      return;
    }

    getUser()
      .then((user) => setUser(user))
      .catch((e) => {
        console.error("Failed to fetch user info:", e);
      });
  }, [hasExpiresAtCookie, user, setUser]);

  // Reconcile the cached identity whenever auth state settles: signed out (no
  // cookie) reconciles to null; signed in reconciles once the user resolves. A
  // cookie present but user not yet loaded is left alone so a transient
  // /auth/user failure isn't mistaken for a logout.
  useEffect(() => {
    if (!hasExpiresAtCookie) {
      reconcileUserCaches(null);
      return;
    }

    if (user) {
      reconcileUserCaches(user.preferredUsername);
    }
  }, [hasExpiresAtCookie, user]);

  return null;
};

export type GetAuthUrlsOptions = {
  redirectUri: string;
  silent?: boolean;
  locale?: string;
};
export function getAuthUrls({
  redirectUri,
  silent,
  locale,
}: GetAuthUrlsOptions) {
  const fullRedirectUri = new URL(redirectUri, globalThis.location.href);

  const loginUrl = new URL("/auth/login", globalThis.location.href);
  loginUrl.searchParams.set("redirect_uri", fullRedirectUri.href);
  loginUrl.searchParams.set("silent", silent ? "true" : "false");
  if (locale) {
    loginUrl.searchParams.set("locale", locale);
  }

  const logoutUrl = new URL("/auth/logout", globalThis.location.href);
  logoutUrl.searchParams.set("redirect_uri", fullRedirectUri.href);
  logoutUrl.searchParams.set("silent", silent ? "true" : "false");
  if (locale) {
    logoutUrl.searchParams.set("locale", locale);
  }

  return {
    loginUrl: loginUrl.href,
    logoutUrl: logoutUrl.href,
  };
}

export type UseAuthUrlsOptions = Omit<GetAuthUrlsOptions, "locale">;
export function useAuthUrls({ redirectUri, silent }: UseAuthUrlsOptions) {
  const currentLanguage = useAtomValue(languageAtom);
  const locale = currentLanguage === "sv" ? "sv" : "en";

  return getAuthUrls({ redirectUri, silent, locale });
}
