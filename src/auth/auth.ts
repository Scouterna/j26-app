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
