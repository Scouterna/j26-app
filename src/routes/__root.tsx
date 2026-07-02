import "../native-app";
import "../notifications/ios-bridge";

import { createRootRoute, Outlet } from "@tanstack/react-router";
import { onMessage } from "firebase/messaging";
import { useEffect } from "react";
import {
  messaging,
  registerForPushNotifications,
} from "../notifications/firebase";
import { showLocalizedNotification } from "../notifications/show-notification";

const RootLayout = () => {
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      registerForPushNotifications().catch((e) => {
        console.error("Failed to register for push notifications:", e);
      });
    }

    let unsubscribeMessage: (() => void) | undefined;
    navigator.serviceWorker.ready.then((registration) => {
      unsubscribeMessage = onMessage(messaging, (payload) => {
        console.log("Foreground message received:", payload);
        const raw = payload.data?.payload;
        if (!raw) {
          console.error("Foreground message missing data.payload", payload);
          return;
        }

        showLocalizedNotification(registration, raw).catch((e) =>
          console.error("Failed to show notification:", e),
        );
      });
    });

    return () => unsubscribeMessage?.();
  }, []);

  return <Outlet />;
};

export const Route = createRootRoute({ component: RootLayout });
