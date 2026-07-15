import "../native-app";
import "../notifications/ios-bridge";

import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { onMessage } from "firebase/messaging";
import { useEffect } from "react";
import {
  messaging,
  registerForPushNotifications,
} from "../notifications/firebase";
import { resolveLink } from "../notifications/resolve-link";
import { showPushNotification } from "../notifications/show-notification";

const RootLayout = () => {
  const navigate = useNavigate();

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

        showPushNotification(registration, payload).catch((e) =>
          console.error("Failed to show notification:", e),
        );
      });
    });

    // FCM's own click handler for background notifications (see sw.ts) only
    // focuses an already-open window rather than navigating it, then posts
    // this message expecting the app to navigate itself — otherwise clicking
    // a background notification while the app is already open goes nowhere.
    const handleNotificationClick = (event: MessageEvent) => {
      if (
        !event.data?.isFirebaseMessaging ||
        event.data.messageType !== "notification-clicked"
      ) {
        return;
      }

      const rawLink =
        event.data.fcmOptions?.link ?? event.data.notification?.click_action;
      const link = resolveLink(rawLink ?? null);
      if (link) navigate({ href: link });
    };
    navigator.serviceWorker.addEventListener(
      "message",
      handleNotificationClick,
    );

    return () => {
      unsubscribeMessage?.();
      navigator.serviceWorker.removeEventListener(
        "message",
        handleNotificationClick,
      );
    };
  }, [navigate]);

  return <Outlet />;
};

export const Route = createRootRoute({ component: RootLayout });
