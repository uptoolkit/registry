/**
 * Wall activity vocabulary and fixtures.
 *
 * A wall stream is wider than a timeline: alongside `Create` and `Announce` it
 * carries the small social signals — reactions, follows, joins, album additions,
 * profile changes — that a plain feed drops on the floor. Everything here is
 * shaped like real ActivityStreams so swapping in an `outbox` page is a matter
 * of replacing {@link sampleWallCollection}.
 */

import {
  ACTIVITY_STREAMS_CONTEXT,
  PUBLIC_AUDIENCE,
  resolveActor,
  type ActivityPubActivity,
  type ActivityPubActor,
  type ActivityPubCollection,
  type ActivityPubDocument,
  type ActivityPubObject,
} from "../../lib/activitypub/activitypub";
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
} from "../../lib/social-sample-data/social-sample-data";

/**
 * Any activity a wall can carry.
 *
 * The object may be a bare IRI, an inlined object, or — for `Follow` and
 * `Join` — the actor or group being acted upon.
 */
export type WallActivity = ActivityPubActivity<ActivityPubObject | ActivityPubActor | string>;

/**
 * How a wall entry is rendered.
 *
 * `post` entries get a full card with reactions and comments; every other kind
 * collapses to a single attributed line.
 */
export type WallEntryKind = "post" | "share" | "reaction" | "follow" | "album" | "profile" | "join";

/** Filter buckets shown above the stream. */
export type WallFilter = "all" | "posts" | "photos" | "people" | "wall";

export type WallEntry = {
  activity: WallActivity;
  actor: ActivityPubActor;
  kind: WallEntryKind;
  /** The resolved object, when the activity carries one inline. */
  object?: ActivityPubObject;
  /** The actor or group acted upon, for `Follow` and `Join`. */
  target?: ActivityPubActor;
  /** True when this is a post someone else wrote *on* the owner's wall. */
  fromVisitor: boolean;
  published: string;
};

/** An actor is the only thing in the vocabulary with a `preferredUsername`. */
function isWallActor(value: WallActivity["object"]): value is ActivityPubActor {
  return typeof value === "object" && value !== null && "preferredUsername" in value;
}

function isWallObject(value: WallActivity["object"]): value is ActivityPubObject {
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

/** A note written by a visitor onto the owner's wall. */
function buildWallPost(options: {
  author: ActivityPubActor;
  owner: ActivityPubActor;
  slug: string;
  content: string;
  minutesAgo: number;
  attachment?: readonly ActivityPubDocument[];
  likes?: number;
  shares?: number;
}): ActivityPubObject {
  const id = `${options.author.id}/posts/${options.slug}`;

  return {
    id,
    type: "Note",
    attributedTo: options.author,
    content: options.content,
    published: minutesAgo(options.minutesAgo),
    url: id,
    inLanguage: "en",
    // A wall post is addressed to the owner as well as the public, which is
    // what marks it as "on their wall" rather than a post that merely mentions
    // them.
    to: [PUBLIC_AUDIENCE],
    cc: [options.owner.id],
    audience: [options.owner.id],
    tag: [{ type: "Mention", name: `@${options.owner.preferredUsername}`, href: options.owner.id }],
    ...(options.attachment ? { attachment: options.attachment } : {}),
    likes: { type: "Collection", id: `${id}/likes`, totalItems: options.likes ?? 0 },
    shares: { type: "Collection", id: `${id}/shares`, totalItems: options.shares ?? 0 },
    replies: { type: "Collection", id: `${id}/replies`, totalItems: 0, items: [] },
  };
}

const welcomeWallPost = buildWallPost({
  author: sampleViewer,
  owner: sampleAuthor,
  slug: "wall-welcome",
  minutesAgo: 18,
  content:
    "<p>Congratulations on the atlas launch. Ten years of survey work and it finally has a front door.</p>",
  likes: 34,
  shares: 2,
});

const photoWallPost = buildWallPost({
  author: sampleFollowers[2],
  owner: sampleAuthor,
  slug: "wall-fieldwork-photos",
  minutesAgo: 320,
  content: "<p>Found these from the Svalbard trip. You were holding the theodolite backwards.</p>",
  attachment: [
    buildImage("svalbard-1", "Two surveyors on a snowfield with a theodolite"),
    buildImage("svalbard-2", "A weathered field notebook open on a rock"),
  ],
  likes: 88,
  shares: 4,
});

const albumPhotos: readonly ActivityPubDocument[] = [
  buildImage("atlas-plate-1", "Contour plate one, inked"),
  buildImage("atlas-plate-2", "Contour plate two, inked"),
  buildImage("atlas-plate-3", "Contour plate three, with survey annotations"),
  buildImage("atlas-plate-4", "Contour plate four, coastline detail"),
  buildImage("atlas-plate-5", "Contour plate five, elevation shading"),
];

const photoAlbum: ActivityPubObject = {
  id: `${sampleAuthor.id}/collections/atlas-plates`,
  type: "Page",
  attributedTo: sampleAuthor,
  name: "Atlas plates, 2019-2025",
  content: "<p>Every inked plate from the atlas, in order.</p>",
  published: minutesAgo(1450),
  url: `${sampleAuthor.id}/collections/atlas-plates`,
  attachment: albumPhotos,
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
 * A wall page shaped like an `outbox` response, newest first.
 *
 * Deliberately mixes every activity type the feed knows how to render so the
 * block is a working demonstration the moment it is installed.
 */
export const sampleWallCollection: ActivityPubCollection<WallActivity> = {
  "@context": ACTIVITY_STREAMS_CONTEXT,
  id: `${sampleAuthor.id}/outbox?page=1`,
  type: "OrderedCollection",
  totalItems: 486,
  orderedItems: [
    buildCreateActivity(welcomeWallPost),
    {
      id: `${sampleFollowers[1].id}/activities/like/5512`,
      type: "Like",
      actor: sampleFollowers[1],
      object: samplePost,
      published: minutesAgo(26),
    },
    buildCreateActivity(samplePost),
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
      object: sampleAuthor.id,
      published: minutesAgo(140),
    },
    buildCreateActivity(photoWallPost),
    {
      id: `${sampleFollowers[3].id}/activities/emojireact/992`,
      type: "EmojiReact",
      actor: sampleFollowers[3],
      content: "\u{1F5FA}\u{FE0F}",
      object: samplePost,
      published: minutesAgo(400),
    },
    buildCreateActivity(mentionPost),
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
  ],
  next: `${sampleAuthor.id}/outbox?page=2`,
};

/** Classifies an activity into the row the wall renders for it. */
export function getWallEntryKind(activity: WallActivity): WallEntryKind | undefined {
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
    default:
      return undefined;
  }
}

/**
 * A post is "on the wall" when it is addressed to the owner by someone else,
 * which is how the visitor/owner split is drawn without a second field.
 */
function isVisitorPost(object: ActivityPubObject | undefined, ownerId: string): boolean {
  if (!object) {
    return false;
  }

  return [...(object.cc ?? []), ...(object.audience ?? [])].includes(ownerId);
}

/** Resolves a collection of raw activities into renderable wall entries. */
export function toWallEntries(
  activities: readonly WallActivity[],
  owner: ActivityPubActor,
): WallEntry[] {
  return activities.flatMap((activity) => {
    const kind = getWallEntryKind(activity);
    const actor = resolveActor(activity.actor);

    if (!kind || !actor) {
      return [];
    }

    const object = isWallObject(activity.object) ? activity.object : undefined;
    // A `Follow` on someone's own wall usually addresses them by bare IRI, so
    // resolve that back to the owner rather than rendering a verb with no noun.
    const target = isWallActor(activity.object)
      ? activity.object
      : activity.object === owner.id
        ? owner
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
        fromVisitor: actor.id !== owner.id && isVisitorPost(object, owner.id),
        published,
      },
    ];
  });
}

const filterPredicates = {
  all: () => true,
  posts: (entry: WallEntry) => entry.kind === "post" || entry.kind === "share",
  photos: (entry: WallEntry) =>
    entry.kind === "album" ||
    entry.kind === "profile" ||
    (entry.object?.attachment ?? []).some((file) => file.type === "Image"),
  people: (entry: WallEntry) => entry.kind === "follow" || entry.kind === "join",
  wall: (entry: WallEntry) => entry.kind === "post" && entry.fromVisitor,
} as const satisfies Record<WallFilter, (entry: WallEntry) => boolean>;

export function filterWallEntries(entries: readonly WallEntry[], filter: WallFilter): WallEntry[] {
  return entries.filter(filterPredicates[filter]);
}

/** Size of every filter bucket, so the filter row can label and disable tabs. */
export function countWallEntries(entries: readonly WallEntry[]): Record<WallFilter, number> {
  return {
    all: filterWallEntries(entries, "all").length,
    posts: filterWallEntries(entries, "posts").length,
    photos: filterWallEntries(entries, "photos").length,
    people: filterWallEntries(entries, "people").length,
    wall: filterWallEntries(entries, "wall").length,
  };
}

export type WallEntryGroup = {
  /** Stable key derived from the calendar day, safe for SSR. */
  id: string;
  label: string;
  entries: WallEntry[];
};

/**
 * Buckets entries into "Today", "Yesterday", then month headings.
 *
 * The label is computed from `now` rather than the wall clock so a server render
 * and its hydration agree.
 */
export function groupWallEntries(
  entries: readonly WallEntry[],
  options: { now?: Date | number; locale?: string } = {},
): WallEntryGroup[] {
  const now = new Date(options.now ?? SAMPLE_NOW);
  const today = toDayKey(now);
  const yesterday = toDayKey(new Date(now.getTime() - 86_400_000));
  const groups: WallEntryGroup[] = [];

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
