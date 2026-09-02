"use client";

import {
  IconCalendarPlus,
  IconHeartFilled,
  IconPhoto,
  IconTrash,
  IconUserPlus,
  IconUsersGroup,
} from "@tabler/icons-react";
import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  isPostEntryKind,
  type FeedEntry,
  type FeedEntryKind,
} from "../../lib/activity-entries/activity-entries";
import {
  formatPublishedTime,
  getActorDisplayName,
  toPlainText,
  type ActivityPubActivity,
  type ActivityPubActor,
  type ActivityPubDocument,
} from "../../lib/activitypub/activitypub";
import { ActorAvatar } from "../actor-avatar/actor-avatar";
import { PostCard } from "../post-card/post-card";

/** Copy and iconography for collapsed, non-post rows. */
type CollapsedKind = Exclude<FeedEntryKind, "post" | "share">;

const kindConfig: Record<
  CollapsedKind,
  { icon: typeof IconHeartFilled; tone: string; verb: string }
> = {
  reaction: {
    icon: IconHeartFilled,
    tone: "text-rose-600 dark:text-rose-400",
    verb: "reacted to a post",
  },
  follow: {
    icon: IconUserPlus,
    tone: "text-sky-600 dark:text-sky-400",
    verb: "started following",
  },
  album: {
    icon: IconPhoto,
    tone: "text-amber-600 dark:text-amber-400",
    verb: "added photos to an album",
  },
  profile: {
    icon: IconCalendarPlus,
    tone: "text-violet-600 dark:text-violet-400",
    verb: "updated their profile",
  },
  join: {
    icon: IconUsersGroup,
    tone: "text-teal-600 dark:text-teal-400",
    verb: "joined a group",
  },
  delete: {
    icon: IconTrash,
    tone: "text-muted-foreground",
    verb: "deleted a post",
  },
};

type ActivityFeedItemProps = {
  entry: FeedEntry;
  /** The signed-in actor, forwarded to post cards. */
  viewer?: ActivityPubActor;
  /** When set, shows a ribbon for posts addressed to this actor. */
  subject?: ActivityPubActor;
  /** Fixed "now" for relative timestamps. */
  now?: Date | number;
  /** BCP 47 locale for dates. Must match on server and client. */
  locale?: string;
  /** Rendered under post cards when provided. */
  children?: React.ReactNode;
  /** Called when a collapsed activity row is selected. */
  onSelect?: (entry: FeedEntry) => void;
  /** Any activity a post emits: Like, EmojiReact, Announce, or Undo. */
  onActivity?: (activity: ActivityPubActivity<unknown>) => void;
  className?: string;
};

/**
 * One ActivityPub activity in a feed.
 *
 * `Create` and `Announce` entries render as full {@link PostCard} rows; every
 * other kind collapses to a single attributed line with an icon badge.
 */
function ActivityFeedItem({
  entry,
  viewer,
  subject,
  now,
  locale,
  children,
  onSelect,
  onActivity,
  className,
}: ActivityFeedItemProps) {
  if (isPostEntryKind(entry.kind) && entry.object) {
    return (
      <ActivityFeedPostItem
        entry={entry}
        viewer={viewer}
        subject={subject}
        now={now}
        locale={locale}
        onActivity={onActivity}
        className={className}
      >
        {children}
      </ActivityFeedPostItem>
    );
  }

  if (!isPostEntryKind(entry.kind)) {
    const collapsedKind = entry.kind as CollapsedKind;

    return (
      <ActivityFeedCollapsedItem
        entry={entry}
        kind={collapsedKind}
        now={now}
        locale={locale}
        onSelect={onSelect}
        className={className}
      />
    );
  }

  return null;
}

function ActivityFeedPostItem({
  entry,
  viewer,
  subject,
  now,
  locale,
  children,
  onActivity,
  className,
}: {
  entry: FeedEntry;
  viewer?: ActivityPubActor;
  subject?: ActivityPubActor;
  now?: Date | number;
  locale?: string;
  children?: React.ReactNode;
  onActivity?: (activity: ActivityPubActivity<unknown>) => void;
  className?: string;
}) {
  if (!entry.object) {
    return null;
  }

  const showRibbon = entry.addressedToSubject && subject;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {showRibbon ? (
        <p className="m-0 flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
          <IconUserPlus aria-hidden="true" className="size-3.5" />
          <span>
            <span className="font-medium text-foreground">{getActorDisplayName(entry.actor)}</span>{" "}
            wrote to {getActorDisplayName(subject)}&rsquo;s feed
          </span>
        </p>
      ) : null}

      <PostCard
        object={entry.object}
        activity={{ ...entry.activity, object: entry.object }}
        {...(viewer ? { viewer } : {})}
        {...(now === undefined ? {} : { now })}
        {...(locale === undefined ? {} : { locale })}
        {...(onActivity
          ? {
              onLike: onActivity,
              onUnlike: onActivity,
              onShare: onActivity,
              onUnshare: onActivity,
            }
          : {})}
      >
        {children}
      </PostCard>
    </div>
  );
}

function ActivityFeedCollapsedItem({
  entry,
  kind,
  now,
  locale,
  onSelect,
  className,
}: {
  entry: FeedEntry;
  kind: CollapsedKind;
  now?: Date | number;
  locale?: string;
  onSelect?: (entry: FeedEntry) => void;
  className?: string;
}) {
  const config = kindConfig[kind];
  const Icon = config.icon;
  const photos = (entry.object?.attachment ?? []).filter(
    (file): file is ActivityPubDocument => file.type === "Image",
  );
  const detail = getEntryDetail(entry);
  const isEmoji = entry.activity.type === "EmojiReact" && Boolean(entry.activity.content);
  const Wrapper = onSelect ? "button" : "div";

  return (
    <Card className={cn("gap-0 py-3", className)}>
      <CardContent className="flex flex-col gap-3">
        <Wrapper
          {...(onSelect ? { type: "button" as const, onClick: () => onSelect(entry) } : {})}
          className={cn(
            "flex w-full items-start gap-3 text-left",
            onSelect && "rounded-md transition-colors hover:opacity-80",
          )}
        >
          <span className="relative shrink-0">
            <ActorAvatar actor={entry.actor} size="sm" />
            <span
              className={cn(
                "absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-background ring-1 ring-border",
                config.tone,
              )}
            >
              {isEmoji ? (
                <span aria-hidden="true" className="text-[10px] leading-none">
                  {entry.activity.content}
                </span>
              ) : (
                <Icon aria-hidden="true" className="size-2.5" />
              )}
            </span>
          </span>

          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-sm">
              <span className="font-semibold">{getActorDisplayName(entry.actor)}</span>{" "}
              <span className="text-muted-foreground">{config.verb}</span>
              {detail ? <span className="font-medium"> {detail}</span> : null}
            </span>
            <time dateTime={entry.published} className="text-xs text-muted-foreground">
              {formatPublishedTime(entry.published, {
                ...(now === undefined ? {} : { now }),
                ...(locale === undefined ? {} : { locale }),
              })}
            </time>
          </span>
        </Wrapper>

        {photos.length > 0 ? (
          <ul className="m-0 grid list-none grid-cols-4 gap-1.5 p-0 sm:grid-cols-5">
            {photos.slice(0, 5).map((photo) => (
              <li key={photo.url} className="overflow-hidden rounded-md border">
                <img
                  src={photo.url}
                  alt={photo.name ?? ""}
                  loading="lazy"
                  className="aspect-square size-full object-cover"
                />
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}

/** Trailing noun for a collapsed row. */
function getEntryDetail(entry: FeedEntry): string | undefined {
  if (entry.kind === "follow" || entry.kind === "join") {
    return entry.target ? getActorDisplayName(entry.target) : undefined;
  }

  if (entry.kind === "album" || entry.kind === "profile") {
    return entry.object?.name ?? undefined;
  }

  const text = toPlainText(entry.object?.content) || entry.object?.name;

  if (!text) {
    return undefined;
  }

  return `“${text.length > 60 ? `${text.slice(0, 59)}…` : text}”`;
}

export { ActivityFeedItem, kindConfig, type ActivityFeedItemProps };
