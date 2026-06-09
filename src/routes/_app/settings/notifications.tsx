import {
  ScoutButton,
  ScoutCallout,
  ScoutListView,
  ScoutListViewItem,
} from "@scouterna/ui-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageContainer } from "../../../components/PageContainer";
import type { components } from "../../../generated/notification-api";
import * as api from "../../../notifications/api";
import { showLocalizedNotification } from "../../../notifications/show-notification";

export const Route = createFileRoute("/_app/settings/notifications")({
  component: RouteComponent,
  staticData: {
    pageName: "page.settings.notifications.label",
  },
});

type Channel = components["schemas"]["ChannelRead"];

const ChannelRow = ({
  channel,
  subscribed,
  onToggle,
}: {
  channel: Channel;
  subscribed: boolean;
  onToggle: () => void;
}) => {
  const subscribe = useMutation({
    mutationFn: (channelId: string) => api.subscribe(channelId),
    onSettled: () => onToggle(),
  });

  const unsubscribe = useMutation({
    mutationFn: (subscriptionId: string) => api.unsubscribe(subscriptionId),
    onSettled: () => onToggle(),
  });

  return (
    <ScoutListViewItem
      type="checkbox"
      key={channel.id}
      disabled={subscribe.isPending || unsubscribe.isPending}
      primary={channel.name}
      secondary={channel.description ?? undefined}
      checked={subscribed}
      onScoutChecked={() => {
        if (subscribed) {
          unsubscribe.mutate(channel.id);
        } else {
          subscribe.mutate(channel.id);
        }
      }}
    />
  );
};

async function sendTestNotification() {
  if (Notification.permission !== "granted") return "denied";

  const reg = await navigator.serviceWorker.ready;
  await showLocalizedNotification(
    reg,
    JSON.stringify({
      notification: {
        sv: {
          title: "Testnotis",
          body: "Det här är en testnotis som går till kartan.",
        },
      },
      category: null,
      important: false,
      link: "/app/map",
    }),
  );
  return "sent";
}

function TestNotificationButton() {
  const [status, setStatus] = useState<"idle" | "sent" | "denied">("idle");

  const handleClick = async () => {
    const result = await sendTestNotification();
    setStatus(result);
    if (result === "sent") setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <div className="p-4 flex flex-col gap-3">
      <ScoutButton variant="outlined" onScoutClick={handleClick}>
        Skicka testnotis
      </ScoutButton>
      {status === "sent" && (
        <ScoutCallout variant="success">Testnotis skickad!</ScoutCallout>
      )}
      {status === "denied" && (
        <ScoutCallout variant="error">
          Notiser är inte tillåtna. Aktivera dem i telefonens inställningar.
        </ScoutCallout>
      )}
    </div>
  );
}

function RouteComponent() {
  const channels = useQuery({
    queryFn: api.getChannels,
    queryKey: ["notifications", "channels"],
  });

  const subscriptions = useQuery({
    queryFn: api.getSubscriptions,
    queryKey: ["notifications", "subscriptions"],
  });

  const subscribedIds =
    subscriptions.data?.map((sub: any) => sub.channel_id) || [];

  return (
    <PageContainer>
      <div className="p-4">
        <ScoutCallout>
          Välj vilka notiser du vill ta emot från Jamboree-appen. "Viktiga
          meddelanden" är alltid påslaget för att Jamboreeledningen ska kunna nå
          ut med viktig information.
        </ScoutCallout>
      </div>

      <TestNotificationButton />

      <ScoutListView>
        <ScoutListViewItem
          type="checkbox"
          primary="Viktiga meddelanden"
          secondary="Påslaget för alla användare"
          disabled
          checked
        />

        {channels.data?.map((channel: any) => {
          const subscribed = subscribedIds.includes(channel.id);

          return (
            <ChannelRow
              key={channel.id}
              channel={channel}
              subscribed={subscribed}
              onToggle={() => {
                channels.refetch();
              }}
            />
          );
        })}
      </ScoutListView>
    </PageContainer>
  );
}
