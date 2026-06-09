import {
  ScoutCallout,
  ScoutListView,
  ScoutListViewItem,
  ScoutListViewSubheader,
} from "@scouterna/ui-react";
import ChevronRightIcon from "@tabler/icons/outline/chevron-right.svg?raw";
import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { formatDistance, startOfHour } from "date-fns";
import { useAtomValue } from "jotai";
import {
  ScoutButtonLink,
  ScoutListViewItemLink,
} from "../../../../components/links";
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

function resolveText(notification: NotificationRead, lang: string | undefined) {
  const payload = parseNotificationPayload(notification.message);
  const text =
    (lang ? payload?.notification[lang] : null) ??
    payload?.notification.en ??
    payload?.notification.sv ??
    Object.values(payload?.notification ?? {})[0];
  return {
    title: text?.title ?? notification.title,
    body: text?.body ?? notification.body,
    link: resolveLink(payload?.link ?? null),
  };
}

function ImportantNotification({
  notification,
  lang,
  refTime,
}: {
  notification: NotificationRead;
  lang: string | undefined;
  refTime: Date;
}) {
  const { t } = useTranslate();
  const locale = useDateFnsLocale();
  const { title, body, link } = resolveText(notification, lang);
  const timestamp = upperFirst(
    formatDistance(new Date(notification.sent_at), refTime, {
      locale,
      addSuffix: true,
    }),
  );

  return (
    <ScoutCallout variant="warning" heading={title}>
      <div className="flex flex-row">
        <div className="flex-1">
          <p>{body}</p>
          <p className="opacity-60">{timestamp}</p>
        </div>
        {link && (
          <ScoutButtonLink
            slot="actions"
            to={link}
            variant="outlined"
            icon={ChevronRightIcon}
            iconPosition="after"
          >
            {t("app.notification.important.open_link")}
          </ScoutButtonLink>
        )}
      </div>
    </ScoutCallout>
  );
}

function NotificationItem({
  notification,
  lang,
}: {
  notification: NotificationRead;
  lang: string | undefined;
}) {
  const { title, body, link } = resolveText(notification, lang);

  return link ? (
    <ScoutListViewItemLink
      primary={title}
      secondary={body}
      action="chevron"
      to={link}
    />
  ) : (
    <ScoutListViewItem primary={title} secondary={body} />
  );
}

export function Notifications() {
  const locale = useDateFnsLocale();
  const lang = useAtomValue(languageAtom);
  const notifications = useQuery({
    queryKey: ["notifications", "history"],
    queryFn: getNotificationHistory,
  });

  const important = notifications.data?.filter((n) => n.important) ?? [];
  const regular = notifications.data?.filter((n) => !n.important) ?? [];

  const refTime = new Date(notifications.dataUpdatedAt);
  const groups = groupByHour(regular);

  return (
    <div className="flex flex-col">
      {important.length > 0 && (
        <div className="flex flex-col gap-2 p-4 pb-0">
          {important.map((notification) => (
            <ImportantNotification
              key={notification.id}
              notification={notification}
              lang={lang}
              refTime={refTime}
            />
          ))}
        </div>
      )}
      <ScoutListView>
        {groups.flatMap(([bucketTime, items]) => {
          const label = upperFirst(
            formatDistance(bucketTime, refTime, { locale, addSuffix: true }),
          );
          return [
            <ScoutListViewSubheader key={bucketTime.getTime()} text={label} />,
            ...items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                lang={lang}
              />
            )),
          ];
        })}
      </ScoutListView>
    </div>
  );
}
