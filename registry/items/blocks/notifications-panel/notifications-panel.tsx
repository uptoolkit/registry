"use client";

import {
  IconAt,
  IconBell,
  IconHeartFilled,
  IconMessageCircle,
  IconRepeat,
  IconUserPlus,
} from "@tabler/icons-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { ActorAvatar } from "../../components/actor-avatar/actor-avatar";
import {
  formatPublishedTime,
  getActorDisplayName,
  getCollectionItems,
  getObjectId,
  resolveActor,
  resolveObject,
  toPlainText,
  type ActivityPubActivity,
  type ActivityPubActor,
  type ActivityPubCollection,
} from "../../lib/activitypub/activitypub";
import { SAMPLE_NOW, sampleInbox } from "../../lib/social-sample-data/social-sample-data";

type InboxActivity = ActivityPubActivity;

/** Notification categories, mapped from ActivityStreams activity types. */
type NotificationKind = "reaction" | "boost" | "follow" | "mention" | "reply";

const kindConfig: Record<
  NotificationKind,
  { label: string; icon: typeof IconBell; tone: string; verb: string }
> = {
  reaction: {
    label: "Reactions",
    icon: IconHeartFilled,
    tone: "text-rose-600 dark:text-rose-400",
    verb: "reacted to your post",
  },
  boost: {
    label: "Boosts",
    icon: IconRepeat,
    tone: "text-emerald-600 dark:text-emerald-400",
    verb: "boosted your post",
  },
  follow: {
    label: "Follows",
    icon: IconUserPlus,
    tone: "text-sky-600 dark:text-sky-400",
    verb: "followed you",
  },
  mention: {
    label: "Mentions",
    icon: IconAt,
    tone: "text-violet-600 dark:text-violet-400",
    verb: "mentioned you",
  },
  reply: {
    label: "Replies",
    icon: IconMessageCircle,
    tone: "text-muted-foreground",
    verb: "replied to your post",
  },
};

/**
 * Classifies an inbox activity.
 *
 * `Create` splits into `reply` or `mention` depending on whether the object
 * carries `inReplyTo`, which is how clients separate the two in practice.
 */
function isNotificationKind(value: unknown): value is NotificationKind {
  return typeof value === "string" && Object.hasOwn(kindConfig, value);
}

function getNotificationKind(activity: InboxActivity): NotificationKind | undefined {
  switch (activity.type) {
    case "Like":
    case "EmojiReact":
      return "reaction";
    case "Announce":
      return "boost";
    case "Follow":
      return "follow";
    case "Create":
      return resolveObject(activity.object)?.inReplyTo ? "reply" : "mention";
    default:
      return undefined;
  }
}

/** Short excerpt of the object the activity refers to. */
function getNotificationExcerpt(activity: InboxActivity): string | undefined {
  const object = resolveObject(activity.object);
  const text = toPlainText(object?.content) || object?.name;

  if (!text) {
    return undefined;
  }

  return text.length > 120 ? `${text.slice(0, 119)}…` : text;
}

type NotificationsPanelProps = Omit<React.ComponentProps<typeof Card>, "children"> & {
  /** An `inbox` page of activities addressed to the viewer. */
  collection?: ActivityPubCollection<InboxActivity> | readonly InboxActivity[];
  /** The signed-in actor, used to label follow-back actions. */
  viewer?: ActivityPubActor;
  heading?: string;
  /** Activity ids the viewer has not seen yet. */
  unreadIds?: readonly string[];
  /** Hide the category filter row. */
  hideFilters?: boolean;
  maxHeight?: number | string;
  onSelect?: (activity: InboxActivity) => void;
  onMarkAllRead?: () => void;
  /** Fixed "now" for relative timestamps. */
  now?: Date | number;
  /** BCP 47 locale for dates. Must match on server and client. */
  locale?: string;
};

/**
 * Notification panel for an ActivityPub inbox.
 *
 * Reads `Like`, `EmojiReact`, `Announce`, `Follow`, and `Create` activities and
 * groups them into the categories a social client shows, keeping the emoji from
 * an `EmojiReact` so the reaction is visible in the row.
 */
function NotificationsPanel({
  collection = sampleInbox,
  viewer,
  heading = "Notifications",
  unreadIds,
  hideFilters = false,
  maxHeight = 420,
  onSelect,
  onMarkAllRead,
  now = SAMPLE_NOW,
  locale,
  className,
  ...props
}: NotificationsPanelProps) {
  const [filter, setFilter] = React.useState<NotificationKind | "all">("all");
  const [readIds, setReadIds] = React.useState<readonly string[]>([]);

  const entries = React.useMemo(
    () =>
      getCollectionItems(collection).flatMap((activity) => {
        const kind = getNotificationKind(activity);
        const actor = resolveActor(activity.actor);

        return kind && actor ? [{ activity, kind, actor }] : [];
      }),
    [collection],
  );

  const availableKinds = React.useMemo(
    () => [...new Set(entries.map((entry) => entry.kind))],
    [entries],
  );
  const visible = filter === "all" ? entries : entries.filter((entry) => entry.kind === filter);
  const unread = new Set(unreadIds ?? entries.slice(0, 3).map((entry) => entry.activity.id));
  const unreadCount = entries.filter(
    (entry) => unread.has(entry.activity.id) && !readIds.includes(entry.activity.id),
  ).length;

  const handleMarkAllRead = () => {
    setReadIds(entries.map((entry) => entry.activity.id));
    onMarkAllRead?.();
  };

  return (
    <Card className={cn("w-full max-w-md gap-3 py-4", className)} {...props}>
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <IconBell aria-hidden="true" className="size-4" />
            {heading}
            {unreadCount > 0 ? <Badge>{unreadCount}</Badge> : null}
          </CardTitle>
          {unreadCount > 0 ? (
            <Button type="button" variant="ghost" size="sm" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          ) : null}
        </div>

        {hideFilters || availableKinds.length < 2 ? null : (
          <Tabs
            value={filter}
            onValueChange={(value: unknown) => setFilter(isNotificationKind(value) ? value : "all")}
          >
            <TabsList
              variant="line"
              className="flex-wrap justify-start group-data-horizontal/tabs:h-auto"
            >
              <TabsTrigger value="all">All</TabsTrigger>
              {availableKinds.map((kind) => (
                <TabsTrigger key={kind} value={kind}>
                  {kindConfig[kind].label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </CardHeader>

      <CardContent className="px-0">
        <ScrollArea style={{ maxHeight }} className="px-4">
          {visible.length === 0 ? (
            <p className="m-0 py-8 text-center text-sm text-muted-foreground">Nothing here yet.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {visible.map(({ activity, kind, actor }) => {
                const config = kindConfig[kind];
                const Icon = config.icon;
                const isUnread = unread.has(activity.id) && !readIds.includes(activity.id);
                const excerpt = getNotificationExcerpt(activity);
                const targetId = getObjectId(activity.object);

                return (
                  <li key={activity.id}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-start gap-3 rounded-md p-2 text-left transition-colors hover:bg-accent",
                        isUnread && "bg-accent/40",
                      )}
                      onClick={() => {
                        setReadIds((current) => [...current, activity.id]);
                        onSelect?.(activity);
                      }}
                    >
                      <span className="relative shrink-0">
                        <ActorAvatar actor={actor} />
                        <span
                          className={cn(
                            "absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-background ring-1 ring-border",
                            config.tone,
                          )}
                        >
                          {activity.type === "EmojiReact" && activity.content ? (
                            <span aria-hidden="true" className="text-[10px] leading-none">
                              {activity.content}
                            </span>
                          ) : (
                            <Icon aria-hidden="true" className="size-2.5" />
                          )}
                        </span>
                      </span>

                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-sm">
                          <span className="font-semibold">{getActorDisplayName(actor)}</span>{" "}
                          <span className="text-muted-foreground">{config.verb}</span>
                        </span>
                        {excerpt ? (
                          <span className="line-clamp-2 text-xs text-muted-foreground">
                            {excerpt}
                          </span>
                        ) : null}
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          {activity.published ? (
                            <time dateTime={activity.published}>
                              {formatPublishedTime(activity.published, {
                                now,
                                ...(locale === undefined ? {} : { locale }),
                              })}
                            </time>
                          ) : null}
                          {kind === "follow" && viewer && targetId === viewer.id ? (
                            <span className="text-primary">Follow back</span>
                          ) : null}
                        </span>
                      </span>

                      {isUnread ? (
                        <span
                          aria-label="Unread"
                          role="img"
                          className="mt-2 size-2 shrink-0 rounded-full bg-primary"
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export {
  NotificationsPanel,
  getNotificationKind,
  type InboxActivity,
  type NotificationKind,
  type NotificationsPanelProps,
};
