import { ScoutListView, ScoutListViewItem } from "@scouterna/ui-react";
import SettingsIcon from "@tabler/icons/outline/settings.svg?raw";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslate } from "@tolgee/react";
import { formatDistanceToNow } from "date-fns";
import type { components } from "../../../generated/notification-api";
import { useDateFnsLocale } from "../../../language/language";
import { getNotificationHistory } from "../../../notifications/api";

export const Route = createFileRoute("/_app/notifs/")({
  component: RouteComponent,
  staticData: {
    pageName: "page.notifications.title",
    appBarAction: {
      icon: SettingsIcon,
      label: "appBar.notifications.settings.label",
      to: "/settings/notifications",
    },
  },
});

type Notification = components["schemas"]["NotificationRead"];

const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const { t } = useTranslate();
  const locale = useDateFnsLocale();

  const sentAt = new Date(notification.sent_at);
  const sentAtDistance = formatDistanceToNow(sentAt, { locale });

  const sentAtString = t("app.notification.age", {
    time: upperFirst(sentAtDistance),
  });

  return (
    <ScoutListViewItem primary={notification.title} secondary={sentAtString} />
  );
};

function RouteComponent() {
  const notifications = useQuery({
    queryKey: ["notifications", "history"],
    queryFn: getNotificationHistory,
  });

  return (
    <ScoutListView>
      {notifications.data?.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </ScoutListView>
  );
}
