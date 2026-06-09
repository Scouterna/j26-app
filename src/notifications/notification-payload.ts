import { type } from "arktype";

export const NotificationPayload = type("string.json.parse").to({
  notification: {
    "[string]": { title: "string", body: "string" },
  },
  category: "string | null",
  important: "boolean",
  link: "string | null",
});

export type NotificationPayload = typeof NotificationPayload.infer;

export function parseNotificationPayload(
  message: string,
): NotificationPayload | null {
  const result = NotificationPayload(message);
  if (result instanceof type.errors) {
    console.error("Invalid notification payload:", result.summary);
    return null;
  }
  return result;
}
