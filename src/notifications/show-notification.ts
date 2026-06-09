import { type } from "arktype";
import { NOTIFICATION_BADGE, NOTIFICATION_ICON } from "./notification-defaults";
import { resolveLink } from "./resolve-link";
import { loadLanguageFromSW } from "./sw-language";

const NotificationPayload = type("string.json.parse").to({
  notification: {
    "[string]": { title: "string", body: "string" },
  },
  category: "string | null",
  important: "boolean",
  link: "string | null",
});

export async function showLocalizedNotification(
  registration: ServiceWorkerRegistration,
  rawPayload: string,
): Promise<void> {
  const result = NotificationPayload(rawPayload);
  if (result instanceof type.errors) {
    console.error("Invalid notification payload:", result.summary);
    return;
  }

  const lang = await loadLanguageFromSW();
  const t =
    result.notification[lang] ??
    result.notification.en ??
    result.notification.sv ??
    Object.values(result.notification)[0];

  if (!t) {
    console.error("Notification payload has no translations", result);
    return;
  }

  const link = resolveLink(result.link);

  if (!link) {
    console.warn(
      "Notification link is invalid or external, ignoring:",
      result.link,
    );
  }

  await registration.showNotification(t.title, {
    body: t.body,
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_BADGE,
    data: { link },
  });
}
