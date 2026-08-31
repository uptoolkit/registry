"use client";

import {
  IconAlertTriangle,
  IconDots,
  IconGlobe,
  IconLock,
  IconMail,
  IconRepeat,
  IconUsers,
} from "@tabler/icons-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import {
  formatPublishedTime,
  getActorDisplayName,
  getActorHandle,
  getObjectParagraphs,
  getTags,
  getVisibility,
  resolveActor,
  type ActivityPubActivity,
  type ActivityPubActor,
  type ActivityPubDocument,
  type ActivityPubObject,
  type ActivityPubVisibility,
} from "../../lib/activitypub/activitypub";
import { toSocialMediaPostingJsonLd } from "../../lib/schema-org/schema-org";
import { ActorAvatar } from "../actor-avatar/actor-avatar";
import { JsonLd } from "../json-ld/json-ld";
import { ReactionBar, type ReactionBarProps } from "../reaction-bar/reaction-bar";

const visibilityIcons: Record<ActivityPubVisibility, typeof IconGlobe> = {
  public: IconGlobe,
  unlisted: IconLock,
  followers: IconUsers,
  direct: IconMail,
};

const visibilityLabels: Record<ActivityPubVisibility, string> = {
  public: "Public",
  unlisted: "Unlisted",
  followers: "Followers only",
  direct: "Mentioned people only",
};

/** Facebook-style attachment grids, keyed by attachment count. */
const attachmentGrids: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 [&>*:first-child]:row-span-2",
  4: "grid-cols-2",
};

type PostCardProps = Omit<React.ComponentProps<typeof Card>, "children"> & {
  /** The `Note`, `Article`, or other object to render. */
  object: ActivityPubObject;
  /**
   * The wrapping activity. An `Announce` renders the "boosted" attribution
   * header above the post.
   */
  activity?: ActivityPubActivity;
  /** The signed-in actor, forwarded to the reaction bar. */
  viewer?: ActivityPubActor;
  counts?: ReactionBarProps["counts"];
  viewerState?: ReactionBarProps["state"];
  defaultViewerState?: ReactionBarProps["defaultState"];
  onLike?: ReactionBarProps["onLike"];
  onUnlike?: ReactionBarProps["onUnlike"];
  onShare?: ReactionBarProps["onShare"];
  onUnshare?: ReactionBarProps["onUnshare"];
  onReply?: ReactionBarProps["onReply"];
  onMore?: (object: ActivityPubObject) => void;
  /**
   * Custom body renderer. The default renders sanitized plain text with
   * linkified hashtags and mentions; pass your own to render trusted HTML.
   */
  renderContent?: (object: ActivityPubObject) => React.ReactNode;
  /** Renders below the footer. Use for a comment thread. */
  children?: React.ReactNode;
  /** Emits a Schema.org `SocialMediaPosting` JSON-LD script. */
  includeJsonLd?: boolean;
  /**
   * Fixed "now" for relative timestamps. Pass a stable value on the server to
   * avoid a hydration mismatch.
   */
  now?: Date | number;
  /** BCP 47 locale for dates and counts. Must match on server and client. */
  locale?: string;
  hideActions?: boolean;
};

function PostAttachments({ attachments }: { attachments: readonly ActivityPubDocument[] }) {
  const visible = attachments.slice(0, 4);
  const overflow = attachments.length - visible.length;

  return (
    <div
      className={cn(
        "grid gap-0.5 overflow-hidden rounded-lg border",
        attachmentGrids[visible.length] ?? "grid-cols-2",
      )}
    >
      {visible.map((attachment, index) => (
        <figure key={attachment.url} className="relative m-0">
          {attachment.type === "Video" || attachment.type === "Audio" ? (
            <div className="flex aspect-video items-center justify-center bg-muted text-xs text-muted-foreground">
              {attachment.name ?? attachment.type}
            </div>
          ) : (
            <img
              src={attachment.url}
              alt={attachment.name ?? ""}
              width={attachment.width}
              height={attachment.height}
              loading="lazy"
              itemProp="image"
              className={cn(
                "size-full object-cover",
                visible.length === 1 ? "max-h-96" : "aspect-square",
              )}
            />
          )}
          {index === visible.length - 1 && overflow > 0 ? (
            <figcaption className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-semibold text-white">
              +{overflow}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}

type ContentToken = { key: string; text: string; href?: string };
type ContentParagraph = { key: string; tokens: ContentToken[] };

/**
 * Splits the plain-text body into paragraphs and tokens, linking hashtags and
 * mentions to the hrefs carried in the object's `tag` array.
 *
 * Keys are byte offsets into the body rather than array indices, so repeated
 * words do not collide and reordered content does not remount the wrong node.
 */
function getContentParagraphs(object: ActivityPubObject): ContentParagraph[] {
  const mentions = new Map(getTags(object, "Mention").map((tag) => [tag.name, tag.href]));
  const hashtags = new Map(getTags(object, "Hashtag").map((tag) => [tag.name, tag.href]));
  const paragraphs: ContentParagraph[] = [];
  let offset = 0;

  for (const paragraph of getObjectParagraphs(object)) {
    const tokens: ContentToken[] = [];
    let cursor = offset;

    for (const text of paragraph.split(/(\s+)/u)) {
      const href = mentions.get(text) ?? hashtags.get(text);

      tokens.push({ key: `t${cursor}`, text, ...(href ? { href } : {}) });
      cursor += text.length;
    }

    paragraphs.push({ key: `p${offset}`, tokens });
    offset = cursor + 2;
  }

  return paragraphs;
}

/** Plain-text body with hashtags and mentions turned into links. */
function PostContent({ object }: { object: ActivityPubObject }) {
  return (
    <div className="flex flex-col gap-2 text-sm leading-relaxed whitespace-pre-wrap">
      {getContentParagraphs(object).map((paragraph) => (
        <p key={paragraph.key} className="m-0">
          {paragraph.tokens.map((token) =>
            token.text.length > 1 && /^[#@]/u.test(token.text) ? (
              <a
                key={token.key}
                href={token.href ?? `#${encodeURIComponent(token.text)}`}
                className="font-medium text-primary hover:underline"
              >
                {token.text}
              </a>
            ) : (
              token.text
            ),
          )}
        </p>
      ))}
    </div>
  );
}

/**
 * Renders an ActivityPub object as a social post.
 *
 * The markup carries Schema.org microdata (`SocialMediaPosting`) inline and can
 * additionally emit a JSON-LD script. Sensitive posts stay collapsed behind
 * their `summary` content warning until the reader opens them.
 */
function PostCard({
  object,
  activity,
  viewer,
  counts,
  viewerState,
  defaultViewerState,
  onLike,
  onUnlike,
  onShare,
  onUnshare,
  onReply,
  onMore,
  renderContent,
  children,
  includeJsonLd = false,
  now,
  locale,
  hideActions = false,
  className,
  ...props
}: PostCardProps) {
  const [warningOpen, setWarningOpen] = React.useState(false);

  const author = resolveActor(object.attributedTo);
  const booster = activity?.type === "Announce" ? resolveActor(activity.actor) : undefined;
  const { visibility } = getVisibility(object);
  const VisibilityIcon = visibilityIcons[visibility];
  const sensitive = Boolean(object.sensitive && object.summary);
  const contentHidden = sensitive && !warningOpen;
  const permalink = object.url ?? object.id;
  const publishedLabel = formatPublishedTime(object.published, {
    ...(now === undefined ? {} : { now }),
    ...(locale === undefined ? {} : { locale }),
  });

  return (
    <Card
      className={cn("w-full gap-3 py-4", className)}
      itemScope
      itemType="https://schema.org/SocialMediaPosting"
      itemID={object.id}
      {...props}
    >
      <meta itemProp="url" content={permalink} />
      {object.published ? <meta itemProp="datePublished" content={object.published} /> : null}
      {object.updated ? <meta itemProp="dateModified" content={object.updated} /> : null}
      {includeJsonLd ? (
        <JsonLd data={toSocialMediaPostingJsonLd(object, { counts, includeComments: true })} />
      ) : null}

      <CardHeader className="gap-2">
        {booster ? (
          <p className="m-0 flex items-center gap-1.5 text-xs text-muted-foreground">
            <IconRepeat aria-hidden="true" className="size-3.5" />
            <span>
              <span className="font-medium text-foreground">{getActorDisplayName(booster)}</span>{" "}
              boosted
            </span>
          </p>
        ) : null}

        <div className="flex items-start gap-3">
          {author ? <ActorAvatar actor={author} size="lg" /> : null}
          <div className="flex min-w-0 flex-1 flex-col">
            {author ? (
              <span
                className="flex flex-wrap items-center gap-x-1.5 text-sm"
                itemProp="author"
                itemScope
                itemType={
                  author.type === "Organization" || author.type === "Group"
                    ? "https://schema.org/Organization"
                    : "https://schema.org/Person"
                }
              >
                <a
                  href={author.url ?? author.id}
                  className="font-semibold hover:underline"
                  itemProp="url"
                >
                  <span itemProp="name">{getActorDisplayName(author)}</span>
                </a>
                <span className="truncate text-muted-foreground" itemProp="alternateName">
                  {getActorHandle(author)}
                </span>
              </span>
            ) : null}
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {object.published ? (
                <a href={permalink} className="hover:underline">
                  <time dateTime={object.published}>{publishedLabel}</time>
                </a>
              ) : null}
              <VisibilityIcon
                aria-label={visibilityLabels[visibility]}
                className="size-3.5"
                role="img"
              />
              {object.location ? (
                <span itemProp="contentLocation">{object.location.name}</span>
              ) : null}
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Post options"
            onClick={() => onMore?.(object)}
          >
            <IconDots aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {object.name ? (
          <h3 className="m-0 text-base font-semibold" itemProp="headline">
            {object.name}
          </h3>
        ) : null}

        {sensitive ? (
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-sm">
            <IconAlertTriangle aria-hidden="true" className="size-4 text-amber-600" />
            <span className="flex-1" itemProp="abstract">
              {object.summary}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-expanded={warningOpen}
              onClick={() => setWarningOpen((open) => !open)}
            >
              {warningOpen ? "Hide" : "Show"}
            </Button>
          </div>
        ) : null}

        {contentHidden ? null : (
          <div itemProp="articleBody">
            {renderContent ? renderContent(object) : <PostContent object={object} />}
          </div>
        )}

        {!contentHidden && object.attachment?.length ? (
          <PostAttachments attachments={object.attachment} />
        ) : null}

        {getTags(object, "Hashtag").length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {getTags(object, "Hashtag").map((tag) => (
              <Badge key={tag.name} variant="secondary" className="font-normal">
                <meta itemProp="keywords" content={tag.name.replace(/^#/u, "")} />
                {tag.name}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>

      {hideActions ? null : (
        <>
          <Separator />
          <CardFooter className="flex-col items-stretch gap-3">
            <ReactionBar
              object={object}
              viewer={viewer}
              counts={counts}
              state={viewerState}
              defaultState={defaultViewerState}
              onLike={onLike}
              onUnlike={onUnlike}
              onShare={onShare}
              onUnshare={onUnshare}
              onReply={onReply}
              locale={locale}
            />
            {children}
          </CardFooter>
        </>
      )}
    </Card>
  );
}

export { PostCard, PostContent, type PostCardProps };
