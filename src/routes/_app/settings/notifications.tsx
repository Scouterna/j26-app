import {
  ScoutCard,
  ScoutListView,
  ScoutListViewItem,
} from "@scouterna/ui-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { components } from "../../../generated/notification-api";
import * as api from "../../../notifications/api";

export const Route = createFileRoute("/_app/settings/notifications")({
  component: RouteComponent,
  staticData: {
    pageName: "page.notification_settings.title",
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
      onScoutClick={() => {
        if (subscribed) {
          unsubscribe.mutate(channel.id);
        } else {
          subscribe.mutate(channel.id);
        }
      }}
    />
  );
};

function RouteComponent() {
  const channels = useQuery({
    queryFn: api.getChannels,
    queryKey: ["notifications", "channels"],
  });

  const subscriptions = useQuery({
    queryFn: api.getSubscriptions,
    queryKey: ["notifications", "subscriptions"],
  });

  const subscribedIds = subscriptions.data?.map((sub) => sub.channel_id) || [];

  return (
    <>
      <div className="px-2 pt-3 pb-2">
        <ScoutCard className="text-body-sm">
          Välj vilka notiser du vill ta emot från Jamboree-appen. "Viktiga
          meddelanden" är alltid påslaget för att Jamboreeledningen ska kunna nå
          ut med viktig information.
        </ScoutCard>
      </div>

      <ScoutListView>
        <ScoutListViewItem
          type="checkbox"
          primary="Viktiga meddelanden"
          secondary="Påslaget för alla användare"
          disabled
          checked
        />

        {channels.data?.map((channel) => {
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
    </>
  );
}
