/**
 * Sample ActivityPub documents for previewing and testing social UI.
 *
 * Everything here is shaped exactly like what a real `outbox`, `inbox`, or
 * `followers` collection returns, so swapping in live data is a matter of
 * replacing these constants with your fetch.
 *
 * Timestamps are derived from {@link SAMPLE_NOW} rather than `Date.now()` so
 * server and client renders agree.
 */

import {
  ACTIVITY_STREAMS_CONTEXT,
  PUBLIC_AUDIENCE,
  type ActivityPubActivity,
  type ActivityPubActor,
  type ActivityPubCollection,
  type ActivityPubObject,
} from "../activitypub/activitypub";

/** Fixed clock for the fixtures. Pass it as the `now` prop of any component. */
const SAMPLE_NOW = new Date("2025-06-12T15:00:00.000Z");

function minutesAgo(minutes: number): string {
  return new Date(SAMPLE_NOW.getTime() - minutes * 60_000).toISOString();
}

function buildActor(options: {
  username: string;
  domain?: string;
  name: string;
  summary: string;
  type?: ActivityPubActor["type"];
  avatarSeed?: string;
  manuallyApprovesFollowers?: boolean;
  published?: string;
  fields?: ActivityPubActor["attachment"];
}): ActivityPubActor {
  const domain = options.domain ?? "social.example";
  const base = `https://${domain}/users/${options.username}`;

  return {
    "@context": ACTIVITY_STREAMS_CONTEXT,
    id: base,
    type: options.type ?? "Person",
    preferredUsername: options.username,
    name: options.name,
    summary: `<p>${options.summary}</p>`,
    url: base,
    icon: {
      type: "Image",
      mediaType: "image/svg+xml",
      url: `https://api.dicebear.com/9.x/thumbs/svg?seed=${options.avatarSeed ?? options.username}`,
      name: `${options.name} avatar`,
    },
    image: {
      type: "Image",
      mediaType: "image/svg+xml",
      url: `https://api.dicebear.com/9.x/shapes/svg?seed=${options.username}-cover`,
      name: `${options.name} cover image`,
    },
    inbox: `${base}/inbox`,
    outbox: `${base}/outbox`,
    followers: `${base}/followers`,
    following: `${base}/following`,
    published: options.published ?? "2021-03-08T09:00:00.000Z",
    ...(options.manuallyApprovesFollowers ? { manuallyApprovesFollowers: true } : {}),
    ...(options.fields ? { attachment: options.fields } : {}),
  };
}

const sampleViewer = buildActor({
  username: "ada",
  name: "Ada Okoye",
  summary: "Front-end engineer. Building small tools for large groups of people.",
  published: "2020-01-14T10:30:00.000Z",
  fields: [
    {
      type: "PropertyValue",
      name: "Website",
      value: "https://ada.example",
      verifiedAt: minutesAgo(2880),
    },
    { type: "PropertyValue", name: "Location", value: "Lagos, Nigeria" },
    { type: "PropertyValue", name: "Pronouns", value: "she/her" },
  ],
});

const sampleAuthor = buildActor({
  username: "mira",
  domain: "fediverse.example",
  name: "Mira Halvorsen",
  summary: "Cartographer. I make maps of things that are hard to see.",
  published: "2019-07-21T12:00:00.000Z",
  fields: [
    {
      type: "PropertyValue",
      name: "Atlas",
      value: "https://maps.example/mira",
      verifiedAt: minutesAgo(10_080),
    },
    { type: "PropertyValue", name: "Location", value: "Bergen, Norway" },
  ],
});

const sampleFollowers: readonly ActivityPubActor[] = [
  sampleAuthor,
  buildActor({
    username: "tobi",
    name: "Tobi Ferrand",
    summary: "Sound designer. Field recordings from very cold places.",
  }),
  buildActor({
    username: "juno",
    domain: "hachyderm.example",
    name: "Juno Park",
    summary: "Type designer, letterform historian, reluctant poster.",
    manuallyApprovesFollowers: true,
  }),
  buildActor({
    username: "rk",
    name: "Rahel Kebede",
    summary: "Infrastructure. I keep the boring parts running.",
  }),
  buildActor({
    username: "atlas-collective",
    domain: "coop.example",
    name: "Atlas Collective",
    summary: "A worker-owned studio for open mapping tools.",
    type: "Organization",
  }),
  buildActor({
    username: "wren",
    name: "Wren Castellanos",
    summary: "Botanist. Mostly mosses.",
  }),
];

const sampleSuggestions: readonly ActivityPubActor[] = [
  buildActor({
    username: "kestrel",
    domain: "birds.example",
    name: "Kestrel Adeyemi",
    summary: "Ornithologist. Posting hawks until further notice.",
  }),
  buildActor({
    username: "lumen",
    domain: "photo.example",
    name: "Lumen Studio",
    summary: "Analogue film lab and community darkroom.",
    type: "Organization",
  }),
  buildActor({
    username: "sable",
    name: "Sable Nwachukwu",
    summary: "Archivist. Digitising 40 years of community radio.",
    manuallyApprovesFollowers: true,
  }),
];

function buildNote(options: {
  author: ActivityPubActor;
  slug: string;
  content: string;
  minutesAgo: number;
  summary?: string;
  sensitive?: boolean;
  name?: string;
  type?: ActivityPubObject["type"];
  attachment?: ActivityPubObject["attachment"];
  tag?: ActivityPubObject["tag"];
  inReplyTo?: string;
  likes?: number;
  shares?: number;
  location?: ActivityPubObject["location"];
  replies?: readonly ActivityPubObject[];
}): ActivityPubObject {
  const id = `${options.author.id}/posts/${options.slug}`;

  return {
    id,
    type: options.type ?? "Note",
    attributedTo: options.author,
    content: options.content,
    published: minutesAgo(options.minutesAgo),
    to: [PUBLIC_AUDIENCE],
    cc: [options.author.followers ?? `${options.author.id}/followers`],
    url: id,
    inLanguage: "en",
    ...(options.name ? { name: options.name } : {}),
    ...(options.summary ? { summary: options.summary } : {}),
    ...(options.sensitive ? { sensitive: true } : {}),
    ...(options.inReplyTo ? { inReplyTo: options.inReplyTo } : {}),
    ...(options.attachment ? { attachment: options.attachment } : {}),
    ...(options.tag ? { tag: options.tag } : {}),
    ...(options.location ? { location: options.location } : {}),
    likes: {
      type: "Collection",
      id: `${id}/likes`,
      totalItems: options.likes ?? 0,
    },
    shares: {
      type: "Collection",
      id: `${id}/shares`,
      totalItems: options.shares ?? 0,
    },
    replies: {
      type: "Collection",
      id: `${id}/replies`,
      totalItems: options.replies?.length ?? 0,
      items: options.replies ?? [],
    },
  };
}

const mapPost = buildNote({
  author: sampleAuthor,
  slug: "coastline-drift",
  minutesAgo: 34,
  content:
    "<p>Spent the week redrawing a 1:25000 coastline by hand. The shoreline has moved 40 metres inland since the 1984 survey.</p><p>Every map is a snapshot of a place that has already changed. #cartography #openstreetmap</p>",
  tag: [
    { type: "Hashtag", name: "#cartography", href: "https://fediverse.example/tags/cartography" },
    {
      type: "Hashtag",
      name: "#openstreetmap",
      href: "https://fediverse.example/tags/openstreetmap",
    },
  ],
  attachment: [
    {
      type: "Image",
      url: "https://api.dicebear.com/9.x/shapes/svg?seed=coastline",
      name: "Hand-drawn coastline contour map with annotated survey markers",
      width: 1200,
      height: 800,
    },
    {
      type: "Image",
      url: "https://api.dicebear.com/9.x/shapes/svg?seed=survey",
      name: "Comparison overlay of the 1984 and current shoreline",
      width: 1200,
      height: 800,
    },
  ],
  location: { type: "Place", name: "Bergen, Norway", latitude: 60.39, longitude: 5.32 },
  likes: 214,
  shares: 38,
  replies: [
    buildNote({
      author: sampleViewer,
      slug: "coastline-drift-reply-1",
      minutesAgo: 26,
      content:
        "<p>Is the 1984 survey digitised anywhere? I would love to run the two through a diff.</p>",
      inReplyTo: "https://fediverse.example/users/mira/posts/coastline-drift",
      likes: 12,
    }),
    buildNote({
      author: sampleFollowers[1],
      slug: "coastline-drift-reply-2",
      minutesAgo: 21,
      content: "<p>The hand-drawn linework is beautiful. Are you inking these on vellum?</p>",
      inReplyTo: "https://fediverse.example/users/mira/posts/coastline-drift",
      likes: 5,
    }),
  ],
});

/** A reply nested under the first reply, to exercise thread depth. */
const nestedReply = buildNote({
  author: sampleAuthor,
  slug: "coastline-drift-reply-1-1",
  minutesAgo: 18,
  content:
    "<p>It is, but only as scanned TIFFs. I will put the georeferenced version up tonight.</p>",
  inReplyTo: `${sampleViewer.id}/posts/coastline-drift-reply-1`,
  likes: 9,
});

const sampleReplies: readonly ActivityPubObject[] = [
  ...(mapPost.replies?.items ?? []),
  nestedReply,
];

const samplePost = mapPost;

const articlePost = buildNote({
  author: sampleFollowers[4],
  slug: "mapping-tools-report",
  type: "Article",
  minutesAgo: 190,
  name: "What we learned running a mapping co-op for five years",
  content:
    "<p>Five years in, the hardest part was never the software. It was agreeing on what counts as done.</p><p>Full write-up on our site, including the governance docs we wish we had started with.</p>",
  tag: [{ type: "Hashtag", name: "#cooperatives" }],
  likes: 96,
  shares: 51,
});

const sensitivePost = buildNote({
  author: sampleFollowers[2],
  slug: "typeface-rant",
  minutesAgo: 420,
  summary: "Long typography rant, mild swearing",
  sensitive: true,
  content:
    "<p>The default line-height in almost every design tool is wrong for text over 24px and I am tired of pretending otherwise.</p>",
  likes: 63,
  shares: 7,
});

const mentionPost = buildNote({
  author: sampleFollowers[1],
  slug: "cold-recordings",
  minutesAgo: 55,
  content:
    "<p>New set of glacier recordings up. Thanks @mira@fediverse.example for the coordinates. #fieldrecording</p>",
  tag: [
    { type: "Mention", name: "@mira@fediverse.example", href: sampleAuthor.id },
    { type: "Hashtag", name: "#fieldrecording" },
  ],
  attachment: [
    {
      type: "Audio",
      url: "https://audio.example/glacier.ogg",
      name: "Twelve minute glacier field recording",
      mediaType: "audio/ogg",
      duration: "PT12M4S",
    },
  ],
  likes: 41,
  shares: 12,
});

const sampleTimeline: readonly ActivityPubObject[] = [
  samplePost,
  mentionPost,
  articlePost,
  sensitivePost,
];

function buildCreateActivity(object: ActivityPubObject): ActivityPubActivity<ActivityPubObject> {
  return {
    "@context": ACTIVITY_STREAMS_CONTEXT,
    id: `${object.id}/activity`,
    type: "Create",
    actor: object.attributedTo,
    object,
    published: object.published,
    to: object.to,
    cc: object.cc,
  };
}

/** An `Announce` wrapper, so the feed can show a boosted post. */
const sampleAnnounce: ActivityPubActivity<ActivityPubObject> = {
  "@context": ACTIVITY_STREAMS_CONTEXT,
  id: `${sampleFollowers[3].id}/activities/announce/1`,
  type: "Announce",
  actor: sampleFollowers[3],
  object: articlePost,
  published: minutesAgo(12),
  to: [PUBLIC_AUDIENCE],
};

/** Shaped like a real `outbox` response, newest first. */
const sampleFeed: ActivityPubCollection<ActivityPubActivity<ActivityPubObject>> = {
  "@context": ACTIVITY_STREAMS_CONTEXT,
  id: "https://social.example/users/ada/inbox?page=1",
  type: "OrderedCollection",
  totalItems: 128,
  orderedItems: [
    buildCreateActivity(samplePost),
    sampleAnnounce,
    buildCreateActivity(mentionPost),
    buildCreateActivity(sensitivePost),
  ],
  next: "https://social.example/users/ada/inbox?page=2",
};

/** Shaped like an `inbox` page for the notifications UI. */
const sampleInbox: ActivityPubCollection<ActivityPubActivity> = {
  "@context": ACTIVITY_STREAMS_CONTEXT,
  id: "https://social.example/users/ada/notifications?page=1",
  type: "OrderedCollection",
  totalItems: 24,
  orderedItems: [
    {
      id: `${sampleAuthor.id}/activities/like/9821`,
      type: "Like",
      actor: sampleAuthor,
      object: `${sampleViewer.id}/posts/coastline-drift-reply-1`,
      published: minutesAgo(4),
    },
    {
      id: `${sampleFollowers[1].id}/activities/emojireact/771`,
      type: "EmojiReact",
      actor: sampleFollowers[1],
      content: "\u{1F602}",
      object: `${sampleViewer.id}/posts/coastline-drift-reply-1`,
      published: minutesAgo(9),
    },
    {
      id: `${sampleFollowers[3].id}/activities/announce/1`,
      type: "Announce",
      actor: sampleFollowers[3],
      object: articlePost,
      published: minutesAgo(12),
    },
    {
      id: `${sampleSuggestions[0].id}/activities/follow/44`,
      type: "Follow",
      actor: sampleSuggestions[0],
      object: sampleViewer.id,
      published: minutesAgo(48),
    },
    {
      id: `${sampleAuthor.id}/posts/coastline-drift-reply-1-1/activity`,
      type: "Create",
      actor: sampleAuthor,
      object: nestedReply,
      published: nestedReply.published,
    },
    {
      id: `${sampleFollowers[2].id}/activities/follow/12`,
      type: "Follow",
      actor: sampleFollowers[2],
      object: sampleViewer.id,
      published: minutesAgo(1500),
    },
  ],
};

const sampleCounts = {
  viewer: { posts: 412, followers: 3187, following: 291 },
  author: { posts: 1204, followers: 18_940, following: 342 },
} as const;

export {
  SAMPLE_NOW,
  articlePost,
  buildCreateActivity,
  mentionPost,
  nestedReply,
  sampleAnnounce,
  sampleAuthor,
  sampleCounts,
  sampleFeed,
  sampleFollowers,
  sampleInbox,
  samplePost,
  sampleReplies,
  sampleSuggestions,
  sampleTimeline,
  sampleViewer,
  sensitivePost,
};
