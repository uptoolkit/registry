"use client";

import {
  IconCalendarPlus,
  IconHeartFilled,
  IconPhoto,
  IconUserPlus,
  IconUsersGroup,
} from "@tabler/icons-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { ActorAvatar } from "../../components/actor-avatar/actor-avatar";
import { CommentThread } from "../../components/comment-thread/comment-thread";
import { JsonLd } from "../../components/json-ld/json-ld";
import { PostCard } from "../../components/post-card/post-card";
import { PostComposer } from "../../components/post-composer/post-composer";
import {
  formatPublishedTime,
  getActorDisplayName,
  getCollectionItems,
  toPlainText,
  type ActivityPubActivity,
  type ActivityPubActor,
  type ActivityPubCollection,
  type ActivityPubDocument,
  type ActivityPubObject,
} from "../../lib/activitypub/activitypub";
import { toFeedJsonLd } from "../../lib/schema-org/schema-org";
import {
  SAMPLE_NOW,
  sampleAuthor,
  sampleViewer,
} from "../../lib/social-sample-data/social-sample-data";
import {
  countWallEntries,
  filterWallEntries,
  groupWallEntries,
  sampleWallCollection,
  toWallEntries,
  type WallActivity,
  type WallEntry,
  type WallEntryKind,
  type WallFilter,
} from "./wall-activities";

/** Copy and iconography for the collapsed, non-post rows. */
/** The kinds that collapse to a single line. `post` and `share` render as cards. */
type WallRowKind = Exclude<WallEntryKind, "post" | "share">;

const kindConfig: Record<
  WallRowKind,
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
};

const filterLabels = {
  all: "All activity",
  posts: "Posts",
  photos: "Photos",
  people: "People",
  wall: "Wall posts",
} as const satisfies Record<WallFilter, string>;

const filterOrder = [
  "all",
  "posts",
  "photos",
  "people",
  "wall",
] as const satisfies readonly WallFilter[];

function isWallFilter(value: unknown): value is WallFilter {
  return typeof value === "string" && filterOrder.some((filter) => filter === value);
}

type WallFeedProps = Omit<React.ComponentProps<"section">, "children"> & {
  /** The actor whose wall this is. Drives addressing and the visitor split. */
  owner?: ActivityPubActor;
  /** The signed-in actor. Omit for a signed-out, read-only wall. */
  viewer?: ActivityPubActor;
  /** An `outbox` page of wall activities. */
  collection?: ActivityPubCollection<WallActivity> | readonly WallActivity[];
  heading?: string;
  defaultFilter?: WallFilter;
  /** Hide the filter row, for an embedded or single-purpose wall. */
  hideFilters?: boolean;
  /** Hide the composer, for a wall that does not accept visitor posts. */
  hideComposer?: boolean;
  /** Show an inline comment thread under each post. */
  showComments?: boolean;
  /** Called with the `Create` activity from the composer. */
  onPublish?: (activity: ActivityPubActivity<ActivityPubObject>) => void | Promise<void>;
  /** Called with the collection's `next` page URL. */
  onLoadMore?: (next: string) => void | Promise<void>;
  /** Any activity a post emits: Like, EmojiReact, Announce, or the Undo. */
  onActivity?: (activity: ActivityPubActivity<unknown>) => void;
  /** Called when a collapsed activity row is selected. */
  onSelect?: (entry: WallEntry) => void;
  /** Fixed "now" for relative timestamps. */
  now?: Date | number;
  /** BCP 47 locale for dates and counts. Must match on server and client. */
  locale?: string;
};

/**
 * Activity feed for a profile wall.
 *
 * Unlike a timeline, this renders the whole activity vocabulary: `Create` and
 * `Announce` become full post cards, while reactions, follows, album additions,
 * profile changes, and group joins collapse into single attributed lines. The
 * stream is bucketed by day and described by one Schema.org `CollectionPage`.
 */
function WallFeed({
  owner = sampleAuthor,
  viewer = sampleViewer,
  collection = sampleWallCollection,
  heading,
  defaultFilter = "all",
  hideFilters = false,
  hideComposer = false,
  showComments = false,
  onPublish,
  onLoadMore,
  onActivity,
  onSelect,
  now = SAMPLE_NOW,
  locale,
  className,
  ...props
}: WallFeedProps) {
  const [filter, setFilter] = React.useState<WallFilter>(defaultFilter);
  /** Posts written in this session, kept until the caller refetches. */
  const [published, setPublished] = React.useState<WallActivity[]>([]);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const ownerName = getActorDisplayName(owner);
  const label = heading ?? `${ownerName}'s wall`;
  const next = collection && "type" in collection ? collection.next : undefined;

  const entries = React.useMemo(
    () => toWallEntries([...published, ...getCollectionItems(collection)], owner),
    [collection, owner, published],
  );

  const visible = React.useMemo(() => filterWallEntries(entries, filter), [entries, filter]);
  const groups = React.useMemo(
    () => groupWallEntries(visible, { now, ...(locale === undefined ? {} : { locale }) }),
    [visible, now, locale],
  );

  // Only the full post cards belong in the CollectionPage; a "liked a post"
  // row is not itself a posting.
  const postings = React.useMemo(
    () =>
      visible.flatMap((entry) =>
        (entry.kind === "post" || entry.kind === "share") && entry.object ? [entry.object] : [],
      ),
    [visible],
  );

  const counts = React.useMemo(() => countWallEntries(entries), [entries]);

  const handlePublish = React.useCallback(
    async (activity: ActivityPubActivity<ActivityPubObject>) => {
      setPublished((current) => [activity, ...current]);
      await onPublish?.(activity);
    },
    [onPublish],
  );

  const handleLoadMore = React.useCallback(async () => {
    if (!next || loadingMore) {
      return;
    }

    setLoadingMore(true);

    try {
      await onLoadMore?.(next);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, next, onLoadMore]);

  return (
    <section
      aria-label={label}
      className={cn("flex w-full max-w-xl flex-col gap-4", className)}
      {...props}
    >
      <JsonLd
        data={toFeedJsonLd(postings, {
          name: label,
          ...(collection && "type" in collection && collection.id ? { url: collection.id } : {}),
        })}
      />

      {hideComposer || !viewer ? null : (
        <PostComposer
          author={viewer}
          placeholder={
            viewer.id === owner.id ? "What's on your mind?" : `Write something to ${ownerName}...`
          }
          submitLabel={viewer.id === owner.id ? "Post" : "Post to wall"}
          onSubmit={(activity) => handlePublish(activity)}
        />
      )}

      {hideFilters ? null : (
        <Tabs
          value={filter}
          onValueChange={(value: unknown) => setFilter(isWallFilter(value) ? value : "all")}
        >
          <TabsList
            variant="line"
            className="flex-wrap justify-start group-data-horizontal/tabs:h-auto"
          >
            {filterOrder.map((value) => (
              <TabsTrigger key={value} value={value} disabled={counts[value] === 0}>
                {filterLabels[value]}
                <Badge variant="secondary">{counts[value]}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="m-0 text-sm font-medium">Nothing here yet</p>
            <p className="m-0 text-sm text-muted-foreground">
              {filter === "all"
                ? `${ownerName} has not posted anything.`
                : "Try a different filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        groups.map((group) => (
          <section key={group.id} aria-label={group.label} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h3 className="m-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {group.label}
              </h3>
              <Separator className="flex-1" />
            </div>

            <ol className="m-0 flex list-none flex-col gap-3 p-0">
              {group.entries.map((entry) => {
                const kind = entry.kind;

                return (
                  <li key={entry.activity.id}>
                    {kind === "post" || kind === "share" ? (
                      <WallPostEntry
                        entry={entry}
                        owner={owner}
                        viewer={viewer}
                        showComments={showComments}
                        now={now}
                        {...(locale === undefined ? {} : { locale })}
                        {...(onActivity ? { onActivity } : {})}
                      />
                    ) : (
                      <WallActivityRow
                        entry={entry}
                        kind={kind}
                        now={now}
                        {...(locale === undefined ? {} : { locale })}
                        {...(onSelect ? { onSelect } : {})}
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        ))
      )}

      {next ? (
        <Button
          type="button"
          variant="outline"
          className="self-center"
          disabled={loadingMore}
          onClick={() => void handleLoadMore()}
        >
          {loadingMore ? "Loading..." : "Load earlier activity"}
        </Button>
      ) : null}
    </section>
  );
}

/** A full post card, with a "wrote on your wall" ribbon when it is a visitor's. */
function WallPostEntry({
  entry,
  owner,
  viewer,
  showComments,
  now,
  locale,
  onActivity,
}: {
  entry: WallEntry;
  owner: ActivityPubActor;
  viewer?: ActivityPubActor;
  showComments: boolean;
  now: Date | number;
  locale?: string;
  onActivity?: (activity: ActivityPubActivity<unknown>) => void;
}) {
  if (!entry.object) {
    return null;
  }

  const isWallPost = entry.kind === "post" && entry.fromVisitor;

  return (
    <div className="flex flex-col gap-1.5">
      {isWallPost ? (
        <p className="m-0 flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
          <IconUserPlus aria-hidden="true" className="size-3.5" />
          <span>
            <span className="font-medium text-foreground">{getActorDisplayName(entry.actor)}</span>{" "}
            wrote on {getActorDisplayName(owner)}&rsquo;s wall
          </span>
        </p>
      ) : null}

      <PostCard
        object={entry.object}
        activity={{ ...entry.activity, object: entry.object }}
        {...(viewer ? { viewer } : {})}
        now={now}
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
        {showComments ? (
          <>
            <Separator />
            <CommentThread
              object={entry.object}
              {...(viewer ? { viewer } : {})}
              now={now}
              {...(locale === undefined ? {} : { locale })}
              initialCount={2}
            />
          </>
        ) : null}
      </PostCard>
    </div>
  );
}

/** One collapsed line for a reaction, follow, album, profile change, or join. */
function WallActivityRow({
  entry,
  kind,
  now,
  locale,
  onSelect,
}: {
  entry: WallEntry;
  kind: WallRowKind;
  now: Date | number;
  locale?: string;
  onSelect?: (entry: WallEntry) => void;
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
    <Card className="gap-0 py-3">
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
                now,
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

/**
 * The trailing noun for a collapsed row: an album title, the followed actor's
 * name, or a short excerpt of the post that was reacted to.
 */
function getEntryDetail(entry: WallEntry): string | undefined {
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

export { WallFeed, kindConfig, type WallFeedProps };
