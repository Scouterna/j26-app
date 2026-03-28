import { configPromise } from "../config";
import { client } from "./client";

// TODO: The types from the API has changed. Fix that.

export async function getChannels(): Promise<any> {
  const { notificationsTenant } = await configPromise;

  const res = await client.GET("/api/tenants/{tenant_id}/channels", {
    params: {
      path: {
        tenant_id: notificationsTenant,
      },
    },
  });

  if ("error" in res) {
    console.error("Failed to fetch notification channels", res.error);
    return null;
  }

  return res.data;
}

export async function getSubscriptions(): Promise<any> {
  const { notificationsTenant } = await configPromise;

  const res = await client.GET("/api/tenants/{tenant_id}/subscriptions/me", {
    params: {
      path: {
        tenant_id: notificationsTenant,
      },
    },
  });

  if ("error" in res) {
    console.error("Failed to fetch subscriptions", res.error);
    return null;
  }

  return res.data;
}

export async function subscribe(channel: string): Promise<any> {
  console.log("Hi!");
  const { notificationsTenant } = await configPromise;

  const res = await client.POST(
    "/api/tenants/{tenant_id}/channels/{channel_id}/subscriptions",
    {
      params: {
        path: {
          tenant_id: notificationsTenant,
          channel_id: channel,
        },
      },
    },
  );

  if ("error" in res) {
    console.error(`Failed to subscribe to channel ${channel}`, res.error);
    return null;
  }

  return res.data;
}

export async function unsubscribe(channel: string): Promise<any> {
  const { notificationsTenant } = await configPromise;

  const res = await client.DELETE(
    "/api/tenants/{tenant_id}/channels/{channel_id}/subscriptions",
    {
      params: {
        path: {
          tenant_id: notificationsTenant,
          channel_id: channel,
        },
      },
    },
  );

  if ("error" in res) {
    console.error(`Failed to unsubscribe from channel ${channel}`, res.error);
    return null;
  }

  return res.data;
}

export async function getNotificationHistory(): Promise<any> {
  const { notificationsTenant } = await configPromise;

  const res = await client.GET("/api/tenants/{tenant_id}/notifications", {
    params: {
      path: {
        tenant_id: notificationsTenant,
      },
    },
  });

  if ("error" in res) {
    console.error(`Failed to fetch notification history`, res.error);
    return null;
  }

  return res.data;
}
