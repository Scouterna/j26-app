import type { components } from "../generated/notification-api";
import { client } from "./client";

export type NotificationRead = components["schemas"]["NotificationRead"];

export async function getNotificationHistory(): Promise<
  NotificationRead[] | null
> {
  const res = await client.GET("/api/tenants/jamboree26/notifications");

  if ("error" in res) {
    console.error(`Failed to fetch notification history`, res.error);
    return null;
  }

  // The types seems a bit off, so we need to cast it to the correct type
  return res.data ? (res.data as unknown as NotificationRead[]) : null;
}
