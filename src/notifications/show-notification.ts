import { NOTIFICATION_BADGE, NOTIFICATION_ICON } from "./notification-defaults";
import { resolveLink } from "./resolve-link";

interface PushMessage {
  notification?: { title?: string; body?: string };
  fcmOptions?: { link?: string };
}

// Only used for foreground messages — FCM's Web SDK auto-displays and
// auto-handles clicks for background messages itself (see sw.ts), using the
// same notification/fcmOptions fields read here.
export async function showPushNotification(
  registration: ServiceWorkerRegistration,
  message: PushMessage,
): Promise<void> {
  const { title, body } = message.notification ?? {};
  if (!title || !body) {
    console.error("Push message missing notification title/body", message);
    return;
  }

  const rawLink = message.fcmOptions?.link;
  const link = resolveLink(rawLink ?? null);
  if (rawLink && !link) {
    console.warn(
      "Notification link is invalid or external, ignoring:",
      rawLink,
    );
  }

  await registration.showNotification(title, {
    body,
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_BADGE,
    data: { link },
  });
}
