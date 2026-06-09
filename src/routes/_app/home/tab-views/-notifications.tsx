import {
  ScoutListView,
  ScoutListViewItem,
  ScoutListViewSubheader,
} from "@scouterna/ui-react";
import { useQuery } from "@tanstack/react-query";
import { formatDistance, startOfHour } from "date-fns";
import { useAtomValue } from "jotai";
import { ScoutListViewItemLink } from "../../../../components/links";
import { languageAtom, useDateFnsLocale } from "../../../../language/language";
import {
  getNotificationHistory,
  type NotificationRead,
} from "../../../../notifications/api";
import { parseNotificationPayload } from "../../../../notifications/notification-payload";
import { resolveLink } from "../../../../notifications/resolve-link";
import { upperFirst } from "../../../../utils";

function groupByHour(
  notifications: NotificationRead[],
): [Date, NotificationRead[]][] {
  const map = new Map<number, [Date, NotificationRead[]]>();
  for (const n of notifications) {
    const sentAt = new Date(n.sent_at);
    const key = startOfHour(sentAt).getTime();
    const existing = map.get(key);
    if (existing) {
      existing[1].push(n);
      if (sentAt > existing[0]) existing[0] = sentAt;
    } else {
      map.set(key, [sentAt, [n]]);
    }
  }
  return Array.from(map.values()).sort(([a], [b]) => b.getTime() - a.getTime());
}

export function Notifications() {
  const locale = useDateFnsLocale();
  const lang = useAtomValue(languageAtom);
  const notifications = useQuery({
    queryKey: ["notifications", "history"],
    queryFn: getNotificationHistory,
  });

  const refTime = new Date(notifications.dataUpdatedAt);
  const groups = notifications.data ? groupByHour(notifications.data) : [];

  return (
    <ScoutListView>
      {groups.flatMap(([bucketTime, items]) => {
        const label = upperFirst(
          formatDistance(bucketTime, refTime, { locale, addSuffix: true }),
        );
        return [
          <ScoutListViewSubheader key={bucketTime.getTime()} text={label} />,
          ...items.map((notification) => {
            const payload = parseNotificationPayload(notification.message);
            const text =
              (lang ? payload?.notification[lang] : null) ??
              payload?.notification.en ??
              payload?.notification.sv ??
              Object.values(payload?.notification ?? {})[0];
            const title = text?.title ?? notification.title;
            const body = text?.body ?? notification.body;
            const link = resolveLink(payload?.link ?? null);

            return link ? (
              <ScoutListViewItemLink
                key={notification.id}
                primary={title}
                secondary={body}
                action="chevron"
                to={link}
              />
            ) : (
              <ScoutListViewItem
                key={notification.id}
                primary={title}
                secondary={body}
              />
            );
          }),
        ];
      })}
    </ScoutListView>
  );
}
