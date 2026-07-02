import { userAtom } from "../auth/auth";
import { jotaiStore } from "../jotai";
import { languageAtom } from "../language/language";
import { isIosPwa } from "../native-app";
import { registerToken } from "./firebase";

// The native iOS wrapper registers with FCM itself and hands us the token via
// this event — there's no Push API / service worker subscription to read it
// from on iOS, so it can't go through the normal firebase.ts flow.
const PUSH_TOKEN_EVENT = "push-token";
const PENDING_TOKEN_STORAGE_KEY = "ios-fcm-token";

function tryRegisterStoredToken() {
  const token = sessionStorage.getItem(PENDING_TOKEN_STORAGE_KEY);
  if (!token) {
    console.debug("No pending iOS push token to register");
    return;
  }
  if (!jotaiStore.get(userAtom)) {
    console.debug("Not registering iOS push token: user not signed in yet");
    return;
  }

  registerToken(token).then(
    () => {
      console.debug("Registered iOS push token with backend");
    },
    (e) => {
      console.error("Failed to register iOS push token:", e);
    },
  );
}

if (isIosPwa) {
  window.addEventListener(PUSH_TOKEN_EVENT, (event) => {
    const token = (event as CustomEvent<string>).detail;
    if (!token || token === "ERROR GET TOKEN") {
      console.warn(
        "Ignoring invalid iOS push token from native bridge:",
        token,
      );
      return;
    }

    console.debug("Received iOS push token from native bridge");
    sessionStorage.setItem(PENDING_TOKEN_STORAGE_KEY, token);
    tryRegisterStoredToken();
  });

  // Re-registering re-reads the language cookie server-side, so it needs to
  // re-run on login (token may have arrived while signed out) and on
  // language change (backend picks up notification locale from the cookie).
  jotaiStore.sub(userAtom, tryRegisterStoredToken);
  jotaiStore.sub(languageAtom, tryRegisterStoredToken);
}
