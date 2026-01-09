import { type } from "arktype";
import { atom, useAtom } from "jotai";
import { useEffect, useMemo } from "react";

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
  const hasExpiresAtCookie = useMemo(() => checkForExpiresAtCookie(), []);
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
