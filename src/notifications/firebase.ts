import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const FIREBASE_CONFIG = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
const FIREBASE_VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

const firebaseApp = initializeApp(FIREBASE_CONFIG);
export const messaging = getMessaging(firebaseApp);

const SW_READY_TIMEOUT_MS = 20_000;
const GET_TOKEN_TIMEOUT_MS = 20_000;
const REGISTER_TIMEOUT_MS = 20_000;

function rejectAfter(ms: number, message: string): Promise<never> {
  return new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(message)), ms),
  );
}

export async function getFirebaseToken(): Promise<string> {
  const registration = await Promise.race([
    navigator.serviceWorker.ready,
    rejectAfter(SW_READY_TIMEOUT_MS, "Service worker not ready"),
  ]);

  const token = await Promise.race([
    getToken(messaging, {
      vapidKey: FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    }),
    rejectAfter(GET_TOKEN_TIMEOUT_MS, "getToken timed out"),
  ]);

  if (!token) throw new Error("No token returned from Firebase");
  return token;
}

export async function requestAndRegisterForPushNotifications(): Promise<
  NotificationPermission | "error"
> {
  if (!("Notification" in window)) return "denied";
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission;
  try {
    await registerForPushNotifications();
    return "granted";
  } catch (e) {
    console.error("Failed to register for push notifications:", e);
    return "error";
  }
}

export async function registerForPushNotifications(): Promise<void> {
  const registration = await Promise.race([
    navigator.serviceWorker.ready,
    rejectAfter(SW_READY_TIMEOUT_MS, "Service worker not ready"),
  ]);

  const token = await Promise.race([
    getToken(messaging, {
      vapidKey: FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    }),
    rejectAfter(GET_TOKEN_TIMEOUT_MS, "getToken timed out"),
  ]);

  const res = await fetch("/notifications/api/tenants/jamboree26/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ tokens: [token] }),
    signal: AbortSignal.timeout(REGISTER_TIMEOUT_MS),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

  const subscription = await registration.pushManager.getSubscription();
  if (!subscription)
    throw new Error("Push subscription missing after registration");
}
