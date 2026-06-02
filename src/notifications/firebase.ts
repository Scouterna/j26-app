import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { configPromise } from "../config";

const FIREBASE_CONFIG = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
const FIREBASE_VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

const firebaseApp = initializeApp(FIREBASE_CONFIG);
export const messaging = getMessaging(firebaseApp);

const SW_READY_TIMEOUT_MS = 15_000;

export async function registerForPushNotifications(): Promise<void> {
  const registration = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("Service worker not ready")),
        SW_READY_TIMEOUT_MS,
      ),
    ),
  ]);

  const token = await getToken(messaging, {
    vapidKey: FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  const { notificationsTenant } = await configPromise;

  const res = await fetch(
    `/notifications/api/tenants/${notificationsTenant}/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ tokens: [token] }),
    },
  );

  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
}
