"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { ActivityFeedGroup } from "../../components/activity-feed-group/activity-feed-group";
import { ActivityFeedItem } from "../../components/activity-feed-item/activity-feed-item";
import { CommentThread } from "../../components/comment-thread/comment-thread";
import { JsonLd } from "../../components/json-ld/json-ld";
import { PostComposer } from "../../components/post-composer/post-composer";
import {
  countFeedEntries,
  filterFeedEntries,
  filterLabels,
  filterOrder,
  groupFeedEntries,
  isPostEntryKind,
  sampleActivityCollection,
  toFeedEntries,
  toTimelineEntries,
  type FeedActivity,
  type FeedContext,
  type FeedEntry,
  type FeedFilter,
} from "../../lib/activity-entries/activity-entries";
import {
  getCollectionItems,
  type ActivityPubActivity,
  type ActivityPubActor,
  type ActivityPubCollection,
  type ActivityPubObject,
} from "../../lib/activitypub/activitypub";
import { toFeedJsonLd } from "../../lib/schema-org/schema-org";
import { SAMPLE_NOW, sampleViewer } from "../../lib/social-sample-data/social-sample-data";

function isFeedFilter(value: unknown): value is FeedFilter {
  return typeof value === "string" && filterOrder.some((filter) => filter === value);
}

type ActivityFeedVariant = "timeline" | "full";

type ActivityFeedProps = Omit<React.ComponentProps<"section">, "children"> & {
  /** The signed-in actor. Drives the composer and interaction handlers. */
  viewer?: ActivityPubActor;
  /** An `OrderedCollection` page from an inbox or outbox. */
  collection?: ActivityPubCollection<FeedActivity> | readonly FeedActivity[];
  /** Optional subject actor for wall-style visitor post ribbons. */
  context?: FeedContext;
  /**
   * `timeline` renders only `Create` and `Announce` entries.
   * `full` renders the whole ActivityPub vocabulary.
   */
  variant?: ActivityFeedVariant;
  heading?: string;
  defaultFilter?: FeedFilter;
  /** Hide the filter row. Ignored when `variant` is `timeline`. */
  hideFilters?: boolean;
  /** Hide the composer, for example on a read-only public timeline. */
  hideComposer?: boolean;
  /** Group entries under date headings. */
  groupByDate?: boolean;
  /** Show an inline comment thread under each post. */
  showComments?: boolean;
  /** Called with the `Create` activity from the composer. */
  onPublish?: (activity: ActivityPubActivity<ActivityPubObject>) => void | Promise<void>;
  /** Called with the collection's `next` page URL. */
  onLoadMore?: (next: string) => void | Promise<void>;
  /** Any activity emitted by a post: Like, EmojiReact, Announce, or Undo. */
  onActivity?: (activity: ActivityPubActivity<unknown>) => void;
  /** Called when a collapsed activity row is selected. */
  onSelect?: (entry: FeedEntry) => void;
  /** Fixed "now" for relative timestamps. */
  now?: Date | number;
  /** BCP 47 locale for dates and counts. Must match on server and client. */
  locale?: string;
};

/**
 * Composable ActivityPub feed block.
 *
 * Hand it an `OrderedCollection` from an `inbox` or `outbox` and it classifies
 * each activity, optionally filters and groups them, and renders post cards or
 * collapsed rows. The `timeline` variant is a drop-in replacement for a plain
 * home feed; `full` surfaces reactions, follows, albums, and profile changes.
 */
function ActivityFeed({
  viewer = sampleViewer,
  collection = sampleActivityCollection,
  context,
  variant = "full",
  heading = "Activity",
  defaultFilter = "all",
  hideFilters = false,
  hideComposer = false,
  groupByDate = true,
  showComments = false,
  onPublish,
  onLoadMore,
  onActivity,
  onSelect,
  now = SAMPLE_NOW,
  locale,
  className,
  ...props
}: ActivityFeedProps) {
  const [filter, setFilter] = React.useState<FeedFilter>(defaultFilter);
  const [published, setPublished] = React.useState<FeedActivity[]>([]);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const next = collection && "type" in collection ? collection.next : undefined;

  const entries = React.useMemo(
    () => toFeedEntries([...published, ...getCollectionItems(collection)], context),
    [collection, context, published],
  );

  const scoped =
    variant === "timeline" ? toTimelineEntries(entries) : filterFeedEntries(entries, filter);

  const groups = React.useMemo(
    () =>
      groupByDate
        ? groupFeedEntries(scoped, {
            now,
            ...(locale === undefined ? {} : { locale }),
          })
        : [{ id: "all", label: heading, entries: scoped }],
    [groupByDate, heading, locale, now, scoped],
  );

  const postings = React.useMemo(
    () =>
      scoped.flatMap((entry) =>
        isPostEntryKind(entry.kind) && entry.object ? [entry.object] : [],
      ),
    [scoped],
  );

  const counts = React.useMemo(() => countFeedEntries(entries), [entries]);
  const showFilterRow = variant === "full" && !hideFilters;

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
      aria-label={heading}
      className={cn("flex w-full max-w-xl flex-col gap-4", className)}
      {...props}
    >
      <JsonLd
        data={toFeedJsonLd(postings, {
          name: heading,
          ...(collection && "type" in collection && collection.id ? { url: collection.id } : {}),
        })}
      />

      {hideComposer ? null : (
        <PostComposer author={viewer} onSubmit={(activity) => handlePublish(activity)} />
      )}

      {showFilterRow ? (
        <Tabs
          value={filter}
          onValueChange={(value: unknown) => setFilter(isFeedFilter(value) ? value : "all")}
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
      ) : null}

      {scoped.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="m-0 text-sm font-medium">Nothing here yet</p>
            <p className="m-0 text-sm text-muted-foreground">
              {filter === "all" ? "No activity to show." : "Try a different filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        groups.map((group) => (
          <ActivityFeedGroup key={group.id} label={group.label}>
            <ol className="m-0 flex list-none flex-col gap-3 p-0">
              {group.entries.map((entry) => (
                <li key={entry.activity.id}>
                  <ActivityFeedItem
                    entry={entry}
                    viewer={viewer}
                    subject={context?.subject}
                    now={now}
                    {...(locale === undefined ? {} : { locale })}
                    {...(onActivity ? { onActivity } : {})}
                    {...(onSelect ? { onSelect } : {})}
                  >
                    {showComments && entry.object ? (
                      <>
                        <Separator />
                        <CommentThread
                          object={entry.object}
                          viewer={viewer}
                          now={now}
                          {...(locale === undefined ? {} : { locale })}
                          initialCount={2}
                        />
                      </>
                    ) : null}
                  </ActivityFeedItem>
                </li>
              ))}
            </ol>
          </ActivityFeedGroup>
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
          {loadingMore ? "Loading..." : "Load older activity"}
        </Button>
      ) : null}
    </section>
  );
}

export { ActivityFeed, type ActivityFeedProps, type ActivityFeedVariant };
