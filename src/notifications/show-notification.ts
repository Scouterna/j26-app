import { NOTIFICATION_ICON } from "./notification-defaults";
import { parseNotificationPayload } from "./notification-payload";
import { resolveLink } from "./resolve-link";
import { loadLanguageFromSW } from "./sw-language";

export async function showLocalizedNotification(
  registration: ServiceWorkerRegistration,
  rawPayload: string,
): Promise<void> {
  const result = parseNotificationPayload(rawPayload);
  if (!result) return;

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
    // badge: NOTIFICATION_BADGE,
    data: { link },
  });
}
