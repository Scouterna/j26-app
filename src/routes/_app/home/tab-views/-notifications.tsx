import { ScoutListView, ScoutListViewItem } from "@scouterna/ui-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { formatDistanceToNow } from "date-fns";
import type { components } from "../../../../generated/notification-api";
import { useDateFnsLocale } from "../../../../language/language";
import { getNotificationHistory } from "../../../../notifications/api";
import { upperFirst } from "../../../../utils";

type Notification = components["schemas"]["NotificationRead"];

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

export function Notifications() {
  const notifications = useQuery({
    queryKey: ["notifications", "history"],
    queryFn: getNotificationHistory,
  });

  return (
    <ScoutListView>
      {notifications.data?.map((notification: any) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </ScoutListView>
  );
}
