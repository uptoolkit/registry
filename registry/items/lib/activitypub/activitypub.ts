/**
 * Minimal, dependency-free ActivityStreams 2.0 / ActivityPub vocabulary.
 *
 * Types follow the W3C ActivityStreams 2.0 core and extended vocabularies so the
 * same objects can be served from a federated `outbox` and rendered by the UI.
 *
 * @see https://www.w3.org/TR/activitystreams-vocabulary/
 * @see https://www.w3.org/TR/activitypub/
 */

const ACTIVITY_STREAMS_CONTEXT = "https://www.w3.org/ns/activitystreams";
const PUBLIC_AUDIENCE = "https://www.w3.org/ns/activitystreams#Public";
const SECURITY_CONTEXT = "https://w3id.org/security/v1";

/**
 * Default locale for every formatter in this file.
 *
 * `Intl` with an implicit locale resolves to the host locale, which differs
 * between a server and a visitor's browser and shows up as a hydration
 * mismatch. Formatting is deterministic unless a caller opts in to a locale.
 */
const DEFAULT_LOCALE = "en";

type JsonLdContext = string | readonly (string | Record<string, unknown>)[];

type ActorType = "Person" | "Group" | "Organization" | "Service" | "Application";

type ObjectType =
  | "Note"
  | "Article"
  | "Page"
  | "Document"
  | "Image"
  | "Video"
  | "Audio"
  | "Event"
  | "Place"
  | "Question"
  | "Tombstone";

type ActivityType =
  | "Create"
  | "Update"
  | "Delete"
  | "Follow"
  | "Accept"
  | "Reject"
  | "Add"
  | "Remove"
  | "Like"
  | "EmojiReact"
  | "Dislike"
  | "Announce"
  | "Undo"
  | "Block"
  | "Flag"
  | "Join"
  | "Leave";

type CollectionType =
  | "Collection"
  | "OrderedCollection"
  | "CollectionPage"
  | "OrderedCollectionPage";

/** Audience shorthand mapped onto `to`/`cc` by {@link buildAudience}. */
type ActivityPubVisibility = "public" | "unlisted" | "followers" | "direct";

type ActivityPubLink = {
  type: "Link";
  href: string;
  name?: string;
  mediaType?: string;
  rel?: string | readonly string[];
};

type ActivityPubDocument = {
  type: "Document" | "Image" | "Video" | "Audio";
  url: string;
  /** Alt text. ActivityStreams uses `name` for human-readable labels. */
  name?: string | null;
  mediaType?: string;
  width?: number;
  height?: number;
  blurhash?: string;
  duration?: string;
};

/** Profile metadata fields, rendered as key/value rows by profile UIs. */
type ActivityPubPropertyValue = {
  type: "PropertyValue";
  name: string;
  value: string;
  /** Non-standard Mastodon extension set when a rel="me" link is verified. */
  verifiedAt?: string | null;
};

type ActivityPubTag =
  | { type: "Hashtag"; name: string; href?: string }
  | { type: "Mention"; name: string; href: string }
  | { type: "Emoji"; name: string; icon: ActivityPubDocument; id?: string };

type ActivityPubPlace = {
  type: "Place";
  name: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  units?: string;
};

type ActivityPubActor = {
  "@context"?: JsonLdContext;
  id: string;
  type: ActorType;
  /** Local part of the WebFinger `acct:` URI. */
  preferredUsername: string;
  name?: string;
  /** HTML summary, as served by ActivityPub implementations. */
  summary?: string;
  url?: string;
  icon?: ActivityPubDocument;
  /** Header/cover artwork. */
  image?: ActivityPubDocument;
  inbox?: string;
  outbox?: string;
  followers?: string;
  following?: string;
  liked?: string;
  published?: string;
  /** `true` when follows create a pending request instead of a follow. */
  manuallyApprovesFollowers?: boolean;
  discoverable?: boolean;
  attachment?: readonly ActivityPubPropertyValue[];
  tag?: readonly ActivityPubTag[];
  publicKey?: {
    id: string;
    owner: string;
    publicKeyPem: string;
  };
};

type ActivityPubObject = {
  "@context"?: JsonLdContext;
  id: string;
  type: ObjectType;
  attributedTo: string | ActivityPubActor;
  /** HTML content. Render through a sanitizer or {@link toPlainText}. */
  content?: string;
  contentMap?: Record<string, string>;
  /** Title, used by `Article` and `Page`. */
  name?: string;
  /** Content warning. Paired with `sensitive`. */
  summary?: string;
  sensitive?: boolean;
  url?: string;
  published?: string;
  updated?: string;
  inReplyTo?: string | null;
  to?: readonly string[];
  cc?: readonly string[];
  audience?: readonly string[];
  attachment?: readonly ActivityPubDocument[];
  tag?: readonly ActivityPubTag[];
  location?: ActivityPubPlace;
  replies?: ActivityPubCollection<ActivityPubObject>;
  likes?: ActivityPubCollection<ActivityPubActivity>;
  shares?: ActivityPubCollection<ActivityPubActivity>;
  inLanguage?: string;
};

type ActivityPubActivity<TObject = ActivityPubObject | string> = {
  "@context"?: JsonLdContext;
  id: string;
  type: ActivityType;
  actor: string | ActivityPubActor;
  object: TObject;
  target?: string | ActivityPubObject;
  /** Custom emoji or unicode shortcode for `Like`/`EmojiReact`. */
  content?: string;
  published?: string;
  to?: readonly string[];
  cc?: readonly string[];
};

type ActivityPubCollection<TItem> = {
  "@context"?: JsonLdContext;
  id?: string;
  type: CollectionType;
  totalItems?: number;
  items?: readonly TItem[];
  orderedItems?: readonly TItem[];
  first?: string | ActivityPubCollection<TItem>;
  last?: string;
  next?: string;
  prev?: string;
  partOf?: string;
};

type WebFingerHandle = {
  username: string;
  domain: string;
};

const htmlEntities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  "#39": "'",
  "#x27": "'",
};

/** Reads `id` from either a bare IRI reference or an inlined object. */
function getObjectId(value: string | { id?: string } | null | undefined): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  return value?.id;
}

/** Returns the inlined actor, or `undefined` when only an IRI is present. */
function resolveActor(
  value: string | ActivityPubActor | null | undefined,
): ActivityPubActor | undefined {
  return typeof value === "string" || !value ? undefined : value;
}

/** Returns the inlined object, or `undefined` when only an IRI is present. */
function resolveObject(
  value: string | ActivityPubObject | null | undefined,
): ActivityPubObject | undefined {
  return typeof value === "string" || !value ? undefined : value;
}

function getActorDomain(actor: ActivityPubActor): string | undefined {
  for (const candidate of [actor.url, actor.id]) {
    if (!candidate) {
      continue;
    }

    try {
      return new URL(candidate).host;
    } catch {
      continue;
    }
  }

  return undefined;
}

/** Builds the fediverse handle, for example `@ada@social.example`. */
function getActorHandle(actor: ActivityPubActor): string {
  const domain = getActorDomain(actor);

  return domain ? `@${actor.preferredUsername}@${domain}` : `@${actor.preferredUsername}`;
}

/** Builds the WebFinger `acct:` URI used as a stable Schema.org identifier. */
function getActorAcctUri(actor: ActivityPubActor): string {
  return `acct:${getActorHandle(actor).slice(1)}`;
}

function getActorDisplayName(actor: ActivityPubActor): string {
  return actor.name?.trim() || actor.preferredUsername;
}

/** Up to two uppercase letters for avatar fallbacks. */
function getActorInitials(actor: ActivityPubActor): string {
  const words = getActorDisplayName(actor)
    .split(/[\s._-]+/u)
    .filter(Boolean);
  const initials = words.slice(0, 2).map((word) => Array.from(word)[0] ?? "");

  return initials.join("").toUpperCase() || "?";
}

function parseHandle(handle: string): WebFingerHandle | undefined {
  const match = /^@?([^@\s/]+)@([^@\s/]+)$/u.exec(handle.trim());

  if (!match) {
    return undefined;
  }

  return { username: match[1], domain: match[2].toLowerCase() };
}

/** Builds the WebFinger discovery URL for `@user@domain`. */
function buildWebFingerUrl(handle: string): string | undefined {
  const parsed = parseHandle(handle);

  if (!parsed) {
    return undefined;
  }

  const resource = encodeURIComponent(`acct:${parsed.username}@${parsed.domain}`);

  return `https://${parsed.domain}/.well-known/webfinger?resource=${resource}`;
}

/** Strips tags and decodes the common entities found in federated HTML. */
function toPlainText(html: string | undefined): string {
  if (!html) {
    return "";
  }

  return html
    .replace(/<br\s*\/?>/giu, "\n")
    .replace(/<\/p>\s*<p[^>]*>/giu, "\n\n")
    .replace(/<[^>]+>/gu, "")
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/giu, (match, entity: string) => {
      const key = entity.toLowerCase();
      const named = htmlEntities[key];

      if (named) {
        return named;
      }

      const codePoint = key.startsWith("#x")
        ? Number.parseInt(key.slice(2), 16)
        : key.startsWith("#")
          ? Number.parseInt(key.slice(1), 10)
          : Number.NaN;

      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    })
    .replace(/[ \t]+\n/gu, "\n")
    .trim();
}

/** Plain-text body split into paragraphs, ready to render without HTML. */
function getObjectParagraphs(object: ActivityPubObject): string[] {
  return toPlainText(object.content)
    .split(/\n{2,}/u)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function isPublicAudience(audience: readonly string[] | undefined): boolean {
  return Boolean(audience?.includes(PUBLIC_AUDIENCE));
}

/**
 * Derives the Mastodon-style visibility from `to`/`cc`.
 *
 * - `public`: Public in `to`
 * - `unlisted`: Public in `cc` only
 * - `followers`: addressed to the followers collection
 * - `direct`: everything else
 */
function getVisibility(object: Pick<ActivityPubObject, "to" | "cc" | "attributedTo">): {
  visibility: ActivityPubVisibility;
} {
  if (isPublicAudience(object.to)) {
    return { visibility: "public" };
  }

  if (isPublicAudience(object.cc)) {
    return { visibility: "unlisted" };
  }

  const followers = resolveActor(object.attributedTo)?.followers;
  const addressed = [...(object.to ?? []), ...(object.cc ?? [])];

  if (followers && addressed.includes(followers)) {
    return { visibility: "followers" };
  }

  return { visibility: "direct" };
}

/** Inverse of {@link getVisibility}: turns a visibility into `to`/`cc`. */
function buildAudience(options: {
  visibility: ActivityPubVisibility;
  actor: ActivityPubActor;
  mentions?: readonly string[];
}): { to: string[]; cc: string[] } {
  const followers = options.actor.followers ?? `${options.actor.id}/followers`;
  const mentions = [...new Set(options.mentions ?? [])];

  switch (options.visibility) {
    case "public":
      return { to: [PUBLIC_AUDIENCE], cc: [followers, ...mentions] };
    case "unlisted":
      return { to: [followers], cc: [PUBLIC_AUDIENCE, ...mentions] };
    case "followers":
      return { to: [followers], cc: mentions };
    case "direct":
    default:
      return { to: mentions, cc: [] };
  }
}

function getCollectionItems<TItem>(
  collection: ActivityPubCollection<TItem> | readonly TItem[] | undefined,
): readonly TItem[] {
  if (!collection) {
    return [];
  }

  if (!("type" in collection)) {
    return collection;
  }

  return collection.orderedItems ?? collection.items ?? [];
}

/** Prefers `totalItems` so paginated collections still report a full count. */
function getCollectionCount<TItem>(
  collection: ActivityPubCollection<TItem> | readonly TItem[] | undefined,
): number {
  if (!collection) {
    return 0;
  }

  if ("type" in collection && typeof collection.totalItems === "number") {
    return collection.totalItems;
  }

  return getCollectionItems(collection).length;
}

function getTags<TType extends ActivityPubTag["type"]>(
  object: Pick<ActivityPubObject, "tag">,
  type: TType,
): Extract<ActivityPubTag, { type: TType }>[] {
  return (object.tag ?? []).filter(
    (tag): tag is Extract<ActivityPubTag, { type: TType }> => tag.type === type,
  );
}

const relativeTimeUnits: readonly [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["week", 7 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
];

/**
 * Formats an ActivityStreams `published` timestamp as relative time.
 *
 * Pass `now` explicitly on the server to keep output deterministic between
 * server and client renders.
 */
function formatPublishedTime(
  published: string | undefined,
  options: { now?: Date | number; locale?: string } = {},
): string {
  if (!published) {
    return "";
  }

  const timestamp = Date.parse(published);

  if (Number.isNaN(timestamp)) {
    return "";
  }

  const now = options.now instanceof Date ? options.now.getTime() : (options.now ?? Date.now());
  const elapsed = timestamp - now;
  const magnitude = Math.abs(elapsed);
  const formatter = new Intl.RelativeTimeFormat(options.locale ?? DEFAULT_LOCALE, {
    numeric: "auto",
  });

  for (const [unit, duration] of relativeTimeUnits) {
    if (magnitude >= duration) {
      return formatter.format(Math.round(elapsed / duration), unit);
    }
  }

  return formatter.format(Math.round(elapsed / 1000), "second");
}

function formatCompactNumber(value: number, locale: string = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(
    value,
  );
}

/**
 * Formats an ActivityStreams timestamp as an absolute date, for "Joined March
 * 2021" style labels. Returns `undefined` for a missing or unparseable value.
 */
function formatPublishedDate(
  published: string | undefined,
  options: { locale?: string; dateStyle?: Intl.DateTimeFormatOptions } = {},
): string | undefined {
  if (!published) {
    return undefined;
  }

  const timestamp = Date.parse(published);

  if (Number.isNaN(timestamp)) {
    return undefined;
  }

  return new Intl.DateTimeFormat(
    options.locale ?? DEFAULT_LOCALE,
    options.dateStyle ?? { month: "long", year: "numeric" },
  ).format(timestamp);
}

function createActivityId(actor: ActivityPubActor, type: ActivityType, seed?: string): string {
  const suffix = seed ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  return `${actor.id}/activities/${type.toLowerCase()}/${suffix}`;
}

/** Wraps a new `Note` in the `Create` activity an outbox would deliver. */
function createNoteActivity(options: {
  actor: ActivityPubActor;
  content: string;
  visibility?: ActivityPubVisibility;
  summary?: string;
  sensitive?: boolean;
  inReplyTo?: string | null;
  attachment?: readonly ActivityPubDocument[];
  tag?: readonly ActivityPubTag[];
  published?: string;
  id?: string;
  objectId?: string;
}): ActivityPubActivity<ActivityPubObject> {
  const published = options.published ?? new Date().toISOString();
  const mentions = (options.tag ?? [])
    .filter((tag): tag is Extract<ActivityPubTag, { type: "Mention" }> => tag.type === "Mention")
    .map((tag) => tag.href);
  const audience = buildAudience({
    visibility: options.visibility ?? "public",
    actor: options.actor,
    mentions,
  });
  const objectId = options.objectId ?? `${options.actor.id}/posts/${Date.parse(published)}`;

  const object: ActivityPubObject = {
    id: objectId,
    type: "Note",
    attributedTo: options.actor,
    content: options.content,
    published,
    to: audience.to,
    cc: audience.cc,
    ...(options.summary ? { summary: options.summary } : {}),
    ...(options.sensitive ? { sensitive: true } : {}),
    ...(options.inReplyTo ? { inReplyTo: options.inReplyTo } : {}),
    ...(options.attachment?.length ? { attachment: options.attachment } : {}),
    ...(options.tag?.length ? { tag: options.tag } : {}),
  };

  return {
    "@context": ACTIVITY_STREAMS_CONTEXT,
    id: options.id ?? createActivityId(options.actor, "Create", String(Date.parse(published))),
    type: "Create",
    actor: options.actor,
    object,
    published,
    to: audience.to,
    cc: audience.cc,
  };
}

/** `Like`, or `EmojiReact` when `content` carries an emoji reaction. */
function createLikeActivity(options: {
  actor: ActivityPubActor;
  object: string | ActivityPubObject;
  content?: string;
  published?: string;
  id?: string;
}): ActivityPubActivity {
  const published = options.published ?? new Date().toISOString();

  return {
    "@context": ACTIVITY_STREAMS_CONTEXT,
    id: options.id ?? createActivityId(options.actor, options.content ? "EmojiReact" : "Like"),
    type: options.content ? "EmojiReact" : "Like",
    actor: options.actor,
    object: getObjectId(options.object) ?? options.object,
    published,
    ...(options.content ? { content: options.content } : {}),
  };
}

/** `Announce` is the fediverse equivalent of a share or boost. */
function createAnnounceActivity(options: {
  actor: ActivityPubActor;
  object: string | ActivityPubObject;
  visibility?: ActivityPubVisibility;
  published?: string;
  id?: string;
}): ActivityPubActivity {
  const published = options.published ?? new Date().toISOString();
  const audience = buildAudience({
    visibility: options.visibility ?? "public",
    actor: options.actor,
  });

  return {
    "@context": ACTIVITY_STREAMS_CONTEXT,
    id: options.id ?? createActivityId(options.actor, "Announce"),
    type: "Announce",
    actor: options.actor,
    object: getObjectId(options.object) ?? options.object,
    published,
    to: audience.to,
    cc: audience.cc,
  };
}

function createFollowActivity(options: {
  actor: ActivityPubActor;
  object: string | ActivityPubActor;
  published?: string;
  id?: string;
}): ActivityPubActivity<string> {
  const target = getObjectId(options.object);

  return {
    "@context": ACTIVITY_STREAMS_CONTEXT,
    id: options.id ?? createActivityId(options.actor, "Follow"),
    type: "Follow",
    actor: options.actor,
    object: target ?? "",
    published: options.published ?? new Date().toISOString(),
    to: target ? [target] : [],
  };
}

/** Wraps a previously delivered activity so it can be retracted. */
function createUndoActivity<TObject>(options: {
  actor: ActivityPubActor;
  activity: ActivityPubActivity<TObject>;
  published?: string;
  id?: string;
}): ActivityPubActivity<ActivityPubActivity<TObject>> {
  return {
    "@context": ACTIVITY_STREAMS_CONTEXT,
    id: options.id ?? createActivityId(options.actor, "Undo"),
    type: "Undo",
    actor: options.actor,
    object: options.activity,
    published: options.published ?? new Date().toISOString(),
    ...(options.activity.to ? { to: options.activity.to } : {}),
  };
}

/** Unwraps `Announce` and `Create` so UIs can render the underlying object. */
function getActivityObject(
  activity: ActivityPubActivity | ActivityPubObject,
): ActivityPubObject | undefined {
  if (!("actor" in activity)) {
    return activity;
  }

  return resolveObject(activity.object);
}

export {
  ACTIVITY_STREAMS_CONTEXT,
  DEFAULT_LOCALE,
  PUBLIC_AUDIENCE,
  SECURITY_CONTEXT,
  buildAudience,
  buildWebFingerUrl,
  createAnnounceActivity,
  createFollowActivity,
  createLikeActivity,
  createNoteActivity,
  createUndoActivity,
  formatCompactNumber,
  formatPublishedDate,
  formatPublishedTime,
  getActivityObject,
  getActorAcctUri,
  getActorDisplayName,
  getActorDomain,
  getActorHandle,
  getActorInitials,
  getCollectionCount,
  getCollectionItems,
  getObjectId,
  getObjectParagraphs,
  getTags,
  getVisibility,
  isPublicAudience,
  parseHandle,
  resolveActor,
  resolveObject,
  toPlainText,
  type ActivityPubActivity,
  type ActivityPubActor,
  type ActivityPubCollection,
  type ActivityPubDocument,
  type ActivityPubLink,
  type ActivityPubObject,
  type ActivityPubPlace,
  type ActivityPubPropertyValue,
  type ActivityPubTag,
  type ActivityPubVisibility,
  type ActivityType,
  type ActorType,
  type CollectionType,
  type JsonLdContext,
  type ObjectType,
  type WebFingerHandle,
};
