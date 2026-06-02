import { createRootRoute, Outlet } from "@tanstack/react-router";
import { onMessage } from "firebase/messaging";
import { useEffect } from "react";
import {
  messaging,
  registerForPushNotifications,
} from "../notifications/firebase";

const RootLayout = () => {
  useEffect(() => {
    if (Notification.permission === "granted") {
      registerForPushNotifications().catch((e) => {
        console.error("Failed to register for push notifications:", e);
      });
    }

    let unsubscribeMessage: (() => void) | undefined;
    navigator.serviceWorker.ready.then((registration) => {
      unsubscribeMessage = onMessage(messaging, (payload) => {
        console.log("Foreground message received:", payload);
        registration.showNotification(
          payload.notification?.title || "Notification",
          { body: payload.notification?.body },
        );
      });
    });

    return () => unsubscribeMessage?.();
  }, []);

  return <Outlet />;
};

export const Route = createRootRoute({ component: RootLayout });
