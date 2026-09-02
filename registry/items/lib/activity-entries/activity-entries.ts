/**
 * Activity feed vocabulary and helpers.
 *
 * Turns raw ActivityPub activities from an `inbox`, `outbox`, or `liked`
 * collection into renderable feed entries. The classification mirrors the
 * ActivityStreams 2.0 core and extended vocabularies so swapping in a live
 * collection is a matter of replacing {@link sampleActivityCollection}.
 */

import {
  ACTIVITY_STREAMS_CONTEXT,
  resolveActor,
  type ActivityPubActivity,
  type ActivityPubActor,
  type ActivityPubCollection,
  type ActivityPubDocument,
  type ActivityPubObject,
} from "../activitypub/activitypub";
import {
  SAMPLE_NOW,
  articlePost,
  buildCreateActivity,
  mentionPost,
  samplePost,
  sampleAuthor,
  sampleFollowers,
  sampleSuggestions,
  sampleViewer,
} from "../social-sample-data/social-sample-data";

/** Any activity a feed can carry. */
export type FeedActivity = ActivityPubActivity<ActivityPubObject | ActivityPubActor | string>;

/**
 * How a feed entry is rendered.
 *
 * `post` and `share` become full cards; every other kind collapses to a single
 * attributed line.
 */
export type FeedEntryKind =
  | "post"
  | "share"
  | "reaction"
  | "follow"
  | "album"
  | "profile"
  | "join"
  | "delete";

/** Filter buckets shown above the stream. */
export type FeedFilter = "all" | "posts" | "photos" | "people" | "reactions";

export type FeedEntry = {
  activity: FeedActivity;
  actor: ActivityPubActor;
  kind: FeedEntryKind;
  /** The resolved object, when the activity carries one inline. */
  object?: ActivityPubObject;
  /** The actor or group acted upon, for `Follow` and `Join`. */
  target?: ActivityPubActor;
  /**
   * True when this is a post addressed to a subject actor by someone else.
   * Requires `subject` in {@link FeedContext}.
   */
  addressedToSubject: boolean;
  published: string;
};

/** Optional context for classifying and rendering entries. */
export type FeedContext = {
  /** When set, enables visitor-post detection for wall-style feeds. */
  subject?: ActivityPubActor;
};

function isFeedActor(value: FeedActivity["object"]): value is ActivityPubActor {
  return typeof value === "object" && value !== null && "preferredUsername" in value;
}

function isFeedObject(value: FeedActivity["object"]): value is ActivityPubObject {
  return typeof value === "object" && value !== null && "attributedTo" in value;
}

function minutesAgo(minutes: number): string {
  return new Date(SAMPLE_NOW.getTime() - minutes * 60_000).toISOString();
}

function buildImage(seed: string, name: string): ActivityPubDocument {
  return {
    type: "Image",
    mediaType: "image/svg+xml",
    url: `https://api.dicebear.com/9.x/shapes/svg?seed=${seed}`,
    name,
    width: 600,
    height: 600,
  };
}

const photoAlbum: ActivityPubObject = {
  id: `${sampleAuthor.id}/collections/atlas-plates`,
  type: "Page",
  attributedTo: sampleAuthor,
  name: "Atlas plates, 2019-2025",
  content: "<p>Every inked plate from the atlas, in order.</p>",
  published: minutesAgo(1450),
  url: `${sampleAuthor.id}/collections/atlas-plates`,
  attachment: [
    buildImage("atlas-plate-1", "Contour plate one, inked"),
    buildImage("atlas-plate-2", "Contour plate two, inked"),
    buildImage("atlas-plate-3", "Contour plate three, with survey annotations"),
  ],
};

const coverUpdate: ActivityPubObject = {
  id: `${sampleAuthor.id}#cover`,
  type: "Image",
  attributedTo: sampleAuthor,
  name: "New cover image",
  published: minutesAgo(2600),
  attachment: [buildImage("mira-cover-2025", "Cover image: a stylised contour field")],
};

/**
 * A mixed activity collection shaped like an `outbox` page, newest first.
 *
 * Deliberately carries every activity type the feed knows how to render so the
 * block works the moment it is installed.
 */
export const sampleActivityCollection: ActivityPubCollection<FeedActivity> = {
  "@context": ACTIVITY_STREAMS_CONTEXT,
  id: `${sampleViewer.id}/outbox?page=1`,
  type: "OrderedCollection",
  totalItems: 128,
  orderedItems: [
    buildCreateActivity(samplePost),
    {
      id: `${sampleFollowers[1].id}/activities/like/5512`,
      type: "Like",
      actor: sampleFollowers[1],
      object: samplePost,
      published: minutesAgo(26),
    },
    {
      id: `${sampleAuthor.id}/activities/announce/881`,
      type: "Announce",
      actor: sampleAuthor,
      object: articlePost,
      published: minutesAgo(96),
    },
    {
      id: `${sampleSuggestions[0].id}/activities/follow/301`,
      type: "Follow",
      actor: sampleSuggestions[0],
      object: sampleViewer.id,
      published: minutesAgo(140),
    },
    buildCreateActivity(mentionPost),
    {
      id: `${sampleFollowers[3].id}/activities/emojireact/992`,
      type: "EmojiReact",
      actor: sampleFollowers[3],
      content: "\u{1F5FA}\u{FE0F}",
      object: samplePost,
      published: minutesAgo(400),
    },
    {
      id: `${sampleAuthor.id}/activities/add/77`,
      type: "Add",
      actor: sampleAuthor,
      object: photoAlbum,
      target: `${sampleAuthor.id}/collections/atlas-plates`,
      published: minutesAgo(1450),
    },
    {
      id: `${sampleAuthor.id}/activities/join/4`,
      type: "Join",
      actor: sampleAuthor,
      object: sampleFollowers[4],
      published: minutesAgo(2100),
    },
    {
      id: `${sampleAuthor.id}/activities/update/12`,
      type: "Update",
      actor: sampleAuthor,
      object: coverUpdate,
      published: minutesAgo(2600),
    },
    {
      id: `${samplePost.id}/activities/delete/1`,
      type: "Delete",
      actor: sampleFollowers[2],
      object: samplePost.id,
      published: minutesAgo(3200),
    },
  ],
  next: `${sampleViewer.id}/outbox?page=2`,
};

/** Classifies an activity into the row the feed renders for it. */
export function getFeedEntryKind(activity: FeedActivity): FeedEntryKind | undefined {
  switch (activity.type) {
    case "Create":
      return "post";
    case "Announce":
      return "share";
    case "Like":
    case "EmojiReact":
      return "reaction";
    case "Follow":
      return "follow";
    case "Add":
      return "album";
    case "Update":
      return "profile";
    case "Join":
      return "join";
    case "Delete":
      return "delete";
    default:
      return undefined;
  }
}

/** Whether an entry kind renders as a full post card. */
export function isPostEntryKind(kind: FeedEntryKind): boolean {
  return kind === "post" || kind === "share";
}

function isAddressedToSubject(
  object: ActivityPubObject | undefined,
  subjectId: string,
  actorId: string,
): boolean {
  if (!object || actorId === subjectId) {
    return false;
  }

  return [...(object.cc ?? []), ...(object.audience ?? [])].includes(subjectId);
}

/** Resolves a collection of raw activities into renderable feed entries. */
export function toFeedEntries(
  activities: readonly FeedActivity[],
  context: FeedContext = {},
): FeedEntry[] {
  const subject = context.subject;

  return activities.flatMap((activity) => {
    const kind = getFeedEntryKind(activity);
    const actor = resolveActor(activity.actor);

    if (!kind || !actor) {
      return [];
    }

    const object = isFeedObject(activity.object) ? activity.object : undefined;
    const target = isFeedActor(activity.object)
      ? activity.object
      : subject && activity.object === subject.id
        ? subject
        : undefined;
    const published = activity.published ?? object?.published;

    if (!published) {
      return [];
    }

    return [
      {
        activity,
        actor,
        kind,
        ...(object ? { object } : {}),
        ...(target ? { target } : {}),
        addressedToSubject: subject ? isAddressedToSubject(object, subject.id, actor.id) : false,
        published,
      },
    ];
  });
}

const filterPredicates = {
  all: () => true,
  posts: (entry: FeedEntry) => entry.kind === "post" || entry.kind === "share",
  photos: (entry: FeedEntry) =>
    entry.kind === "album" ||
    entry.kind === "profile" ||
    (entry.object?.attachment ?? []).some((file) => file.type === "Image"),
  people: (entry: FeedEntry) => entry.kind === "follow" || entry.kind === "join",
  reactions: (entry: FeedEntry) => entry.kind === "reaction",
} as const satisfies Record<FeedFilter, (entry: FeedEntry) => boolean>;

export function filterFeedEntries(entries: readonly FeedEntry[], filter: FeedFilter): FeedEntry[] {
  return entries.filter(filterPredicates[filter]);
}

/** Size of every filter bucket, so the filter row can label and disable tabs. */
export function countFeedEntries(entries: readonly FeedEntry[]): Record<FeedFilter, number> {
  return {
    all: filterFeedEntries(entries, "all").length,
    posts: filterFeedEntries(entries, "posts").length,
    photos: filterFeedEntries(entries, "photos").length,
    people: filterFeedEntries(entries, "people").length,
    reactions: filterFeedEntries(entries, "reactions").length,
  };
}

/** Keeps only post and share entries — the timeline variant. */
export function toTimelineEntries(entries: readonly FeedEntry[]): FeedEntry[] {
  return entries.filter((entry) => isPostEntryKind(entry.kind));
}

export type FeedEntryGroup = {
  /** Stable key derived from the calendar day, safe for SSR. */
  id: string;
  label: string;
  entries: FeedEntry[];
};

/**
 * Buckets entries into "Today", "Yesterday", then month headings.
 *
 * The label is computed from `now` rather than the wall clock so a server render
 * and its hydration agree.
 */
export function groupFeedEntries(
  entries: readonly FeedEntry[],
  options: { now?: Date | number; locale?: string } = {},
): FeedEntryGroup[] {
  const now = new Date(options.now ?? SAMPLE_NOW);
  const today = toDayKey(now);
  const yesterday = toDayKey(new Date(now.getTime() - 86_400_000));
  const groups: FeedEntryGroup[] = [];

  for (const entry of entries) {
    const date = new Date(entry.published);
    const dayKey = toDayKey(date);
    const id = dayKey === today || dayKey === yesterday ? dayKey : toMonthKey(date);
    const label =
      dayKey === today
        ? "Today"
        : dayKey === yesterday
          ? "Yesterday"
          : formatMonth(date, options.locale);
    const current = groups.at(-1);

    if (current?.id === id) {
      current.entries.push(entry);
    } else {
      groups.push({ id, label, entries: [entry] });
    }
  }

  return groups;
}

function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toMonthKey(date: Date): string {
  return date.toISOString().slice(0, 7);
}

function formatMonth(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale ?? "en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export const filterLabels = {
  all: "All activity",
  posts: "Posts",
  photos: "Photos",
  people: "People",
  reactions: "Reactions",
} as const satisfies Record<FeedFilter, string>;

export const filterOrder = [
  "all",
  "posts",
  "photos",
  "people",
  "reactions",
] as const satisfies readonly FeedFilter[];
