/**
 * Maps ActivityPub / ActivityStreams 2.0 documents to Schema.org JSON-LD.
 *
 * ActivityPub gives you federation; Schema.org gives you rich results and
 * machine-readable social graphs. Both vocabularies are JSON-LD, so the same
 * source object can be projected into either shape.
 *
 * @see https://schema.org/SocialMediaPosting
 * @see https://schema.org/ProfilePage
 */

import {
  getActorAcctUri,
  getActorDisplayName,
  getActorHandle,
  getCollectionCount,
  getCollectionItems,
  getObjectId,
  getTags,
  resolveActor,
  toPlainText,
  type ActivityPubActivity,
  type ActivityPubActor,
  type ActivityPubCollection,
  type ActivityPubDocument,
  type ActivityPubObject,
  type ActivityType,
} from "../activitypub/activitypub";

const SCHEMA_ORG_CONTEXT = "https://schema.org";

type JsonLdNode = {
  "@context"?: string;
  "@type": string | string[];
  [key: string]: unknown;
};

type SocialInteractionCounts = {
  likes?: number;
  shares?: number;
  replies?: number;
  followers?: number;
  following?: number;
  posts?: number;
  views?: number;
};

type JsonLdOptions = {
  /** Emit `@context`. Disable for nodes nested inside another JSON-LD graph. */
  withContext?: boolean;
};

/** ActivityStreams activity types projected onto Schema.org actions. */
const interactionActionTypes: Partial<Record<ActivityType, string>> = {
  Like: "LikeAction",
  EmojiReact: "LikeAction",
  Announce: "ShareAction",
  Create: "CommentAction",
  Follow: "FollowAction",
  Join: "JoinAction",
};

/** Schema.org type for each ActivityStreams object type. */
const postingTypes: Record<string, string> = {
  Note: "SocialMediaPosting",
  Article: "BlogPosting",
  Page: "WebPage",
  Image: "SocialMediaPosting",
  Video: "SocialMediaPosting",
  Audio: "SocialMediaPosting",
  Question: "SocialMediaPosting",
  Event: "Event",
};

function withContext(node: JsonLdNode, options: JsonLdOptions): JsonLdNode {
  if (options.withContext === false) {
    return node;
  }

  return { "@context": SCHEMA_ORG_CONTEXT, ...node };
}

/** Drops `undefined`, `null`, and empty arrays so output stays compact. */
function compact(node: JsonLdNode): JsonLdNode {
  const result: JsonLdNode = { "@type": node["@type"] };

  for (const [key, value] of Object.entries(node)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value) && value.length === 0) {
      continue;
    }

    result[key] = value;
  }

  return result;
}

function toImageObjectJsonLd(
  document: ActivityPubDocument,
  options: JsonLdOptions = {},
): JsonLdNode {
  const type =
    document.type === "Video"
      ? "VideoObject"
      : document.type === "Audio"
        ? "AudioObject"
        : document.type === "Image"
          ? "ImageObject"
          : "MediaObject";

  return withContext(
    compact({
      "@type": type,
      contentUrl: document.url,
      url: document.url,
      caption: document.name ?? undefined,
      /** Alt text doubles as the accessibility description. */
      description: document.name ?? undefined,
      encodingFormat: document.mediaType,
      width: document.width,
      height: document.height,
      duration: document.duration,
    }),
    options,
  );
}

function toInteractionCounterJsonLd(
  interactionType: string,
  userInteractionCount: number,
): JsonLdNode {
  return {
    "@type": "InteractionCounter",
    interactionType: { "@type": interactionType },
    userInteractionCount,
  };
}

/** Builds the `interactionStatistic` array from ActivityPub counts. */
function toInteractionStatisticJsonLd(counts: SocialInteractionCounts): JsonLdNode[] {
  const mapping: readonly [keyof SocialInteractionCounts, string][] = [
    ["likes", "LikeAction"],
    ["shares", "ShareAction"],
    ["replies", "CommentAction"],
    ["followers", "FollowAction"],
    ["following", "SubscribeAction"],
    ["posts", "WriteAction"],
    ["views", "ViewAction"],
  ];

  return mapping.flatMap(([key, interactionType]) => {
    const value = counts[key];

    return typeof value === "number" ? [toInteractionCounterJsonLd(interactionType, value)] : [];
  });
}

/** Maps an ActivityStreams activity type to its Schema.org action type. */
function toInteractionActionType(type: ActivityType): string | undefined {
  return interactionActionTypes[type];
}

/**
 * Actor → `Person` (or `Organization`, matching the actor type).
 *
 * The WebFinger `acct:` URI is emitted as `identifier` so the Schema.org node
 * stays joinable with the fediverse identity.
 */
function toPersonJsonLd(
  actor: ActivityPubActor,
  options: JsonLdOptions & { counts?: SocialInteractionCounts } = {},
): JsonLdNode {
  const isOrganization = actor.type === "Organization" || actor.type === "Group";
  const links = (actor.attachment ?? [])
    .map((field) => field.value)
    .flatMap((value) => Array.from(value.matchAll(/https?:\/\/[^\s"'<>]+/gu), (match) => match[0]));
  const counts = options.counts ?? {};

  return withContext(
    compact({
      "@type": isOrganization ? "Organization" : "Person",
      "@id": actor.id,
      name: getActorDisplayName(actor),
      alternateName: getActorHandle(actor),
      identifier: getActorAcctUri(actor),
      description: toPlainText(actor.summary) || undefined,
      url: actor.url ?? actor.id,
      image: actor.icon ? toImageObjectJsonLd(actor.icon, { withContext: false }) : undefined,
      sameAs: [...new Set(links)],
      interactionStatistic: toInteractionStatisticJsonLd(counts),
      additionalProperty: (actor.attachment ?? []).map((field) =>
        compact({
          "@type": "PropertyValue",
          name: field.name,
          value: toPlainText(field.value),
        }),
      ),
    }),
    options,
  );
}

function toAuthorJsonLd(object: ActivityPubObject): JsonLdNode | { "@id": string } | undefined {
  const actor = resolveActor(object.attributedTo);

  if (actor) {
    return toPersonJsonLd(actor, { withContext: false });
  }

  const id = getObjectId(object.attributedTo);

  return id ? { "@id": id } : undefined;
}

/**
 * Object → `SocialMediaPosting` (or `BlogPosting` for `Article`).
 *
 * `sharedContent` is populated when the object is a reply so consumers can walk
 * the conversation, and reply counts land in `commentCount`.
 */
function toSocialMediaPostingJsonLd(
  object: ActivityPubObject,
  options: JsonLdOptions & {
    counts?: SocialInteractionCounts;
    /** Include nested `Comment` nodes built from `replies`. */
    includeComments?: boolean;
  } = {},
): JsonLdNode {
  const text = toPlainText(object.content);
  const replyCount = object.replies ? getCollectionCount(object.replies) : options.counts?.replies;
  const counts: SocialInteractionCounts = {
    likes: object.likes ? getCollectionCount(object.likes) : options.counts?.likes,
    shares: object.shares ? getCollectionCount(object.shares) : options.counts?.shares,
    replies: replyCount,
    views: options.counts?.views,
  };
  const comments = options.includeComments
    ? getCollectionItems(object.replies).map((reply) =>
        toCommentJsonLd(reply, { withContext: false }),
      )
    : [];

  return withContext(
    compact({
      "@type": postingTypes[object.type] ?? "SocialMediaPosting",
      "@id": object.id,
      url: object.url ?? object.id,
      headline: object.name ?? undefined,
      /** Content warnings map cleanly onto `abstract`. */
      abstract: object.sensitive ? object.summary : undefined,
      articleBody: text || undefined,
      text: text || undefined,
      datePublished: object.published,
      dateModified: object.updated,
      inLanguage: object.inLanguage ?? Object.keys(object.contentMap ?? {})[0],
      author: toAuthorJsonLd(object),
      image: (object.attachment ?? [])
        .filter((attachment) => attachment.type === "Image")
        .map((attachment) => toImageObjectJsonLd(attachment, { withContext: false })),
      video: (object.attachment ?? [])
        .filter((attachment) => attachment.type === "Video")
        .map((attachment) => toImageObjectJsonLd(attachment, { withContext: false })),
      keywords: getTags(object, "Hashtag").map((tag) => tag.name.replace(/^#/u, "")),
      mentions: getTags(object, "Mention").map((tag) =>
        compact({ "@type": "Person", name: tag.name, url: tag.href }),
      ),
      contentLocation: object.location
        ? compact({
            "@type": "Place",
            name: object.location.name,
            geo:
              object.location.latitude === undefined
                ? undefined
                : compact({
                    "@type": "GeoCoordinates",
                    latitude: object.location.latitude,
                    longitude: object.location.longitude,
                  }),
          })
        : undefined,
      commentCount: replyCount,
      comment: comments,
      sharedContent: object.inReplyTo
        ? { "@type": "SocialMediaPosting", "@id": object.inReplyTo }
        : undefined,
      interactionStatistic: toInteractionStatisticJsonLd(counts),
    }),
    options,
  );
}

/** Reply object → `Comment`, with `parentItem` wired to `inReplyTo`. */
function toCommentJsonLd(object: ActivityPubObject, options: JsonLdOptions = {}): JsonLdNode {
  const text = toPlainText(object.content);

  return withContext(
    compact({
      "@type": "Comment",
      "@id": object.id,
      url: object.url ?? object.id,
      text: text || undefined,
      datePublished: object.published,
      dateModified: object.updated,
      author: toAuthorJsonLd(object),
      parentItem: object.inReplyTo ? { "@type": "Comment", "@id": object.inReplyTo } : undefined,
      commentCount: object.replies ? getCollectionCount(object.replies) : undefined,
      comment: getCollectionItems(object.replies).map((reply) =>
        toCommentJsonLd(reply, { withContext: false }),
      ),
      interactionStatistic: toInteractionStatisticJsonLd({
        likes: object.likes ? getCollectionCount(object.likes) : undefined,
        replies: object.replies ? getCollectionCount(object.replies) : undefined,
      }),
    }),
    options,
  );
}

/** Actor → `ProfilePage`, the page-level node for a profile route. */
function toProfilePageJsonLd(
  actor: ActivityPubActor,
  options: JsonLdOptions & {
    counts?: SocialInteractionCounts;
    /** Recent posts surfaced as `hasPart`. */
    posts?: readonly ActivityPubObject[];
  } = {},
): JsonLdNode {
  return withContext(
    compact({
      "@type": "ProfilePage",
      "@id": `${actor.url ?? actor.id}#profile-page`,
      url: actor.url ?? actor.id,
      name: getActorDisplayName(actor),
      dateCreated: actor.published,
      mainEntity: toPersonJsonLd(actor, { withContext: false, counts: options.counts }),
      hasPart: (options.posts ?? []).map((post) =>
        toSocialMediaPostingJsonLd(post, { withContext: false }),
      ),
    }),
    options,
  );
}

/** Timeline collection → `CollectionPage` wrapping an `ItemList` of postings. */
function toFeedJsonLd(
  collection: ActivityPubCollection<ActivityPubObject> | readonly ActivityPubObject[],
  options: JsonLdOptions & { name?: string; url?: string } = {},
): JsonLdNode {
  const items = getCollectionItems(collection);

  return withContext(
    compact({
      "@type": "CollectionPage",
      "@id": options.url ? `${options.url}#feed` : undefined,
      url: options.url,
      name: options.name,
      mainEntity: compact({
        "@type": "ItemList",
        numberOfItems: getCollectionCount(collection),
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: items.map((item, index) =>
          compact({
            "@type": "ListItem",
            position: index + 1,
            item: toSocialMediaPostingJsonLd(item, { withContext: false }),
          }),
        ),
      }),
    }),
    options,
  );
}

/** Actor list → `ItemList` of `Person` nodes, for follower or people grids. */
function toActorListJsonLd(
  actors: readonly ActivityPubActor[],
  options: JsonLdOptions & { name?: string } = {},
): JsonLdNode {
  return withContext(
    compact({
      "@type": "ItemList",
      name: options.name,
      numberOfItems: actors.length,
      itemListElement: actors.map((actor, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: toPersonJsonLd(actor, { withContext: false }),
      })),
    }),
    options,
  );
}

/** Activity → `Action`, useful for notification and audit feeds. */
function toActionJsonLd(activity: ActivityPubActivity, options: JsonLdOptions = {}): JsonLdNode {
  const actor = resolveActor(activity.actor);
  const objectId = getObjectId(activity.object as string | { id?: string });

  return withContext(
    compact({
      "@type": toInteractionActionType(activity.type) ?? "Action",
      "@id": activity.id,
      startTime: activity.published,
      agent: actor ? toPersonJsonLd(actor, { withContext: false }) : undefined,
      object: objectId ? { "@id": objectId } : undefined,
      actionStatus: "https://schema.org/CompletedActionStatus",
    }),
    options,
  );
}

export {
  SCHEMA_ORG_CONTEXT,
  toActionJsonLd,
  toActorListJsonLd,
  toCommentJsonLd,
  toFeedJsonLd,
  toImageObjectJsonLd,
  toInteractionActionType,
  toInteractionCounterJsonLd,
  toInteractionStatisticJsonLd,
  toPersonJsonLd,
  toProfilePageJsonLd,
  toSocialMediaPostingJsonLd,
  type JsonLdNode,
  type JsonLdOptions,
  type SocialInteractionCounts,
};
