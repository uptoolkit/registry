"use client";

import { IconRefresh } from "@tabler/icons-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { CommentThread } from "../../components/comment-thread/comment-thread";
import { JsonLd } from "../../components/json-ld/json-ld";
import { PostCard } from "../../components/post-card/post-card";
import { PostComposer } from "../../components/post-composer/post-composer";
import {
  getActivityObject,
  getCollectionItems,
  type ActivityPubActivity,
  type ActivityPubActor,
  type ActivityPubCollection,
  type ActivityPubObject,
} from "../../lib/activitypub/activitypub";
import { toFeedJsonLd } from "../../lib/schema-org/schema-org";
import {
  SAMPLE_NOW,
  sampleFeed,
  sampleViewer,
} from "../../lib/social-sample-data/social-sample-data";

type FeedActivity = ActivityPubActivity<ActivityPubObject>;

type SocialFeedProps = Omit<React.ComponentProps<"section">, "children"> & {
  /** The signed-in actor. Drives the composer and interaction handlers. */
  viewer?: ActivityPubActor;
  /** An `OrderedCollection` page from an inbox or outbox. */
  collection?: ActivityPubCollection<FeedActivity> | readonly FeedActivity[];
  heading?: string;
  /** Hide the composer, for example on a read-only public timeline. */
  hideComposer?: boolean;
  /** Show an inline comment thread under each post. */
  showComments?: boolean;
  /** Called with the `Create` activity from the composer. */
  onPublish?: (activity: FeedActivity) => void | Promise<void>;
  /** Called with the collection's `next` page URL. */
  onLoadMore?: (next: string) => void | Promise<void>;
  /** Any activity emitted by a post: Like, EmojiReact, Announce, or Undo. */
  onActivity?: (activity: ActivityPubActivity<unknown>) => void;
  /** Fixed "now" for relative timestamps. */
  now?: Date | number;
  /** BCP 47 locale for dates and counts. Must match on server and client. */
  locale?: string;
};

/**
 * Timeline block for an ActivityPub collection.
 *
 * Accepts an `OrderedCollection` of `Create` and `Announce` activities and
 * renders each wrapped object, so boosts keep their attribution. Newly composed
 * posts are prepended optimistically, and the whole timeline is described by a
 * Schema.org `CollectionPage` JSON-LD node.
 */
function SocialFeed({
  viewer = sampleViewer,
  collection = sampleFeed,
  heading = "Home",
  hideComposer = false,
  showComments = false,
  onPublish,
  onLoadMore,
  onActivity,
  now = SAMPLE_NOW,
  locale,
  className,
  ...props
}: SocialFeedProps) {
  /** Posts composed in this session, kept until the caller refetches. */
  const [published, setPublished] = React.useState<FeedActivity[]>([]);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const activities = React.useMemo(
    () => [...published, ...getCollectionItems(collection)],
    [collection, published],
  );
  const next = collection && "type" in collection ? collection.next : undefined;

  const objects = React.useMemo(
    () =>
      activities.flatMap((activity) => {
        const object = getActivityObject(activity);

        return object ? [{ activity, object }] : [];
      }),
    [activities],
  );

  const handlePublish = React.useCallback(
    async (activity: FeedActivity) => {
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
        data={toFeedJsonLd(
          objects.map((entry) => entry.object),
          {
            name: heading,
            ...(collection && "type" in collection && collection.id ? { url: collection.id } : {}),
          },
        )}
      />

      {hideComposer ? null : (
        <PostComposer author={viewer} onSubmit={(activity) => handlePublish(activity)} />
      )}

      <ol className="m-0 flex list-none flex-col gap-4 p-0">
        {objects.map(({ activity, object }) => (
          <li key={activity.id}>
            <PostCard
              object={object}
              activity={activity}
              viewer={viewer}
              now={now}
              locale={locale}
              onLike={onActivity}
              onUnlike={onActivity}
              onShare={onActivity}
              onUnshare={onActivity}
            >
              {showComments ? (
                <>
                  <Separator />
                  <CommentThread
                    object={object}
                    viewer={viewer}
                    now={now}
                    locale={locale}
                    initialCount={2}
                  />
                </>
              ) : null}
            </PostCard>
          </li>
        ))}
      </ol>

      {next ? (
        <Button
          type="button"
          variant="outline"
          className="self-center"
          disabled={loadingMore}
          onClick={() => void handleLoadMore()}
        >
          <IconRefresh aria-hidden="true" />
          {loadingMore ? "Loading..." : "Load older posts"}
        </Button>
      ) : null}
    </section>
  );
}

export { SocialFeed, type FeedActivity, type SocialFeedProps };
