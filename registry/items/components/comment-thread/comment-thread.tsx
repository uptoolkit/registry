"use client";

import { IconCornerDownRight, IconHeart, IconHeartFilled } from "@tabler/icons-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import {
  createLikeActivity,
  createNoteActivity,
  createUndoActivity,
  formatCompactNumber,
  formatPublishedTime,
  getActorDisplayName,
  getActorHandle,
  getCollectionCount,
  getCollectionItems,
  resolveActor,
  toPlainText,
  type ActivityPubActivity,
  type ActivityPubActor,
  type ActivityPubCollection,
  type ActivityPubObject,
} from "../../lib/activitypub/activitypub";
import { toCommentJsonLd } from "../../lib/schema-org/schema-org";
import { ActorAvatar } from "../actor-avatar/actor-avatar";
import { JsonLd } from "../json-ld/json-ld";

type CommentNode = {
  object: ActivityPubObject;
  children: CommentNode[];
};

/** Oldest first, matching how conversations read. */
function byPublished(a: CommentNode, b: CommentNode): number {
  return Date.parse(a.object.published ?? "") - Date.parse(b.object.published ?? "");
}

/**
 * Builds a reply tree from a flat list using `inReplyTo`.
 *
 * Replies whose parent is missing from the list are attached at the root so
 * nothing is silently dropped from a partially loaded conversation.
 */
function buildCommentTree(
  replies: readonly ActivityPubObject[],
  rootId: string | undefined,
): CommentNode[] {
  const nodes = new Map<string, CommentNode>(
    replies.map((object) => [object.id, { object, children: [] }]),
  );
  const roots: CommentNode[] = [];

  for (const object of replies) {
    const node = nodes.get(object.id);

    if (!node) {
      continue;
    }

    const parentId = object.inReplyTo ?? undefined;
    const parent = parentId && parentId !== rootId ? nodes.get(parentId) : undefined;

    if (parent && parent !== node) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sort = (list: CommentNode[]) => {
    list.sort(byPublished);

    for (const node of list) {
      sort(node.children);
    }
  };

  sort(roots);

  return roots;
}

type CommentThreadProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** The post the replies belong to. */
  object: ActivityPubObject;
  /** Replies. Defaults to the object's own `replies` collection. */
  replies?: ActivityPubCollection<ActivityPubObject> | readonly ActivityPubObject[];
  /** The signed-in actor. Required to compose or like a reply. */
  viewer?: ActivityPubActor;
  /** Nesting levels before replies are flattened. */
  maxDepth?: number;
  /** Root replies shown before the "view more" control. */
  initialCount?: number;
  onReply?: (activity: ActivityPubActivity<ActivityPubObject>) => void | Promise<void>;
  onLike?: (activity: ActivityPubActivity) => void;
  onUnlike?: (activity: ActivityPubActivity<ActivityPubActivity>) => void;
  /** Emits Schema.org `Comment` JSON-LD for the whole thread. */
  includeJsonLd?: boolean;
  /** Fixed "now" for relative timestamps. */
  now?: Date | number;
  /** BCP 47 locale for dates and counts. Must match on server and client. */
  locale?: string;
  /** Hide the composer, for example on a read-only permalink. */
  hideComposer?: boolean;
};

type CommentProps = {
  node: CommentNode;
  depth: number;
  maxDepth: number;
  viewer?: ActivityPubActor;
  now?: Date | number;
  locale?: string;
  onSubmitReply: (parent: ActivityPubObject, content: string) => Promise<void>;
  onLike?: CommentThreadProps["onLike"];
  onUnlike?: CommentThreadProps["onUnlike"];
};

function Comment({
  node,
  depth,
  maxDepth,
  viewer,
  now,
  locale,
  onSubmitReply,
  onLike,
  onUnlike,
}: CommentProps) {
  const [replyOpen, setReplyOpen] = React.useState(false);
  const [childrenOpen, setChildrenOpen] = React.useState(depth < 1);
  const [liked, setLiked] = React.useState(false);
  const likeActivityRef = React.useRef<ActivityPubActivity | null>(null);

  const { object } = node;
  const author = resolveActor(object.attributedTo);
  const likeCount = getCollectionCount(object.likes) + (liked ? 1 : 0);
  const nested = depth + 1 <= maxDepth;

  const handleLike = () => {
    const next = !liked;

    setLiked(next);

    if (!viewer) {
      return;
    }

    if (next) {
      const activity = createLikeActivity({ actor: viewer, object });

      likeActivityRef.current = activity;
      onLike?.(activity);
      return;
    }

    if (likeActivityRef.current) {
      onUnlike?.(createUndoActivity({ actor: viewer, activity: likeActivityRef.current }));
      likeActivityRef.current = null;
    }
  };

  return (
    <li
      className="flex gap-2"
      itemProp="comment"
      itemScope
      itemType="https://schema.org/Comment"
      itemID={object.id}
    >
      <meta itemProp="url" content={object.url ?? object.id} />
      {object.published ? <meta itemProp="datePublished" content={object.published} /> : null}
      {author ? <ActorAvatar actor={author} size="sm" className="mt-1" /> : null}

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="w-fit max-w-full rounded-2xl bg-muted px-3 py-2">
          {author ? (
            <span
              className="flex flex-wrap items-baseline gap-x-1.5"
              itemProp="author"
              itemScope
              itemType="https://schema.org/Person"
            >
              <a
                href={author.url ?? author.id}
                className="text-sm font-semibold hover:underline"
                itemProp="url"
              >
                <span itemProp="name">{getActorDisplayName(author)}</span>
              </a>
              <span className="text-xs text-muted-foreground" itemProp="alternateName">
                {getActorHandle(author)}
              </span>
            </span>
          ) : null}
          <p className="m-0 text-sm whitespace-pre-wrap" itemProp="text">
            {toPlainText(object.content)}
          </p>
        </div>

        <div className="flex items-center gap-1 pl-1 text-xs text-muted-foreground">
          {object.published ? (
            <time dateTime={object.published}>
              {formatPublishedTime(object.published, {
                ...(now === undefined ? {} : { now }),
                ...(locale === undefined ? {} : { locale }),
              })}
            </time>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={liked}
            aria-label={liked ? "Remove like" : "Like reply"}
            className={cn("h-6 px-1.5", liked && "text-rose-600 dark:text-rose-400")}
            onClick={handleLike}
          >
            {liked ? (
              <IconHeartFilled aria-hidden="true" className="size-3.5" />
            ) : (
              <IconHeart aria-hidden="true" className="size-3.5" />
            )}
            {likeCount > 0 ? formatCompactNumber(likeCount, locale) : null}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-1.5"
            aria-expanded={replyOpen}
            onClick={() => setReplyOpen((open) => !open)}
          >
            Reply
          </Button>
        </div>

        {replyOpen ? (
          <CommentComposer
            viewer={viewer}
            placeholder={author ? `Reply to ${getActorDisplayName(author)}` : "Write a reply"}
            submitLabel="Reply"
            onSubmit={async (content) => {
              await onSubmitReply(object, content);
              setReplyOpen(false);
            }}
          />
        ) : null}

        {node.children.length > 0 ? (
          childrenOpen ? (
            <ul className={cn("m-0 flex list-none flex-col gap-3 p-0", nested && "border-l pl-3")}>
              {node.children.map((child) => (
                <Comment
                  key={child.object.id}
                  node={nested ? child : { ...child, children: [] }}
                  depth={nested ? depth + 1 : depth}
                  maxDepth={maxDepth}
                  viewer={viewer}
                  now={now}
                  locale={locale}
                  onSubmitReply={onSubmitReply}
                  onLike={onLike}
                  onUnlike={onUnlike}
                />
              ))}
            </ul>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-fit px-1.5 text-xs"
              onClick={() => setChildrenOpen(true)}
            >
              <IconCornerDownRight aria-hidden="true" className="size-3.5" />
              View {node.children.length} {node.children.length === 1 ? "reply" : "replies"}
            </Button>
          )
        ) : null}
      </div>
    </li>
  );
}

type CommentComposerProps = {
  viewer?: ActivityPubActor;
  placeholder: string;
  submitLabel: string;
  onSubmit: (content: string) => Promise<void>;
};

function CommentComposer({ viewer, placeholder, submitLabel, onSubmit }: CommentComposerProps) {
  const [content, setContent] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const inputId = React.useId();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!content.trim() || pending) {
      return;
    }

    setPending(true);

    try {
      await onSubmit(content.trim());
      setContent("");
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="flex gap-2" onSubmit={(event) => void handleSubmit(event)}>
      {viewer ? <ActorAvatar actor={viewer} size="sm" className="mt-1" /> : null}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <label className="sr-only" htmlFor={inputId}>
          {placeholder}
        </label>
        <Textarea
          id={inputId}
          value={content}
          rows={2}
          placeholder={placeholder}
          className="min-h-9 resize-y rounded-2xl"
          onChange={(event) => setContent(event.target.value)}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={!content.trim() || pending}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

/**
 * Nested reply thread for an ActivityPub object.
 *
 * Replies are `Note` objects carrying `inReplyTo`; new replies are emitted as
 * `Create` activities addressed to the same audience helper the composer uses.
 * Every comment is marked up as a Schema.org `Comment`.
 */
function CommentThread({
  object,
  replies,
  viewer,
  maxDepth = 3,
  initialCount = 3,
  onReply,
  onLike,
  onUnlike,
  includeJsonLd = false,
  now,
  locale,
  hideComposer = false,
  className,
  ...props
}: CommentThreadProps) {
  const [expanded, setExpanded] = React.useState(false);
  /** Locally added replies, so the thread grows without a refetch. */
  const [optimistic, setOptimistic] = React.useState<ActivityPubObject[]>([]);

  const source = React.useMemo(
    () => [...getCollectionItems(replies ?? object.replies), ...optimistic],
    [object.replies, optimistic, replies],
  );
  const tree = React.useMemo(() => buildCommentTree(source, object.id), [object.id, source]);
  const visible = expanded ? tree : tree.slice(0, initialCount);
  const hidden = tree.length - visible.length;

  const handleSubmitReply = React.useCallback(
    async (parent: ActivityPubObject, content: string) => {
      if (!viewer) {
        return;
      }

      const activity = createNoteActivity({
        actor: viewer,
        content,
        inReplyTo: parent.id,
        visibility: "public",
      });

      setOptimistic((current) => [...current, activity.object]);
      await onReply?.(activity);
    },
    [onReply, viewer],
  );

  return (
    <div className={cn("flex w-full flex-col gap-3", className)} {...props}>
      {includeJsonLd ? <JsonLd data={source.map((reply) => toCommentJsonLd(reply))} /> : null}

      {tree.length > 0 ? (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {visible.map((node) => (
            <Comment
              key={node.object.id}
              node={node}
              depth={0}
              maxDepth={maxDepth}
              viewer={viewer}
              now={now}
              locale={locale}
              onSubmitReply={handleSubmitReply}
              onLike={onLike}
              onUnlike={onUnlike}
            />
          ))}
        </ul>
      ) : null}

      {hidden > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit px-1.5 text-xs"
          onClick={() => setExpanded(true)}
        >
          View {hidden} more {hidden === 1 ? "comment" : "comments"}
        </Button>
      ) : null}

      {hideComposer || !viewer ? null : (
        <CommentComposer
          viewer={viewer}
          placeholder="Write a comment..."
          submitLabel="Comment"
          onSubmit={(content) => handleSubmitReply(object, content)}
        />
      )}
    </div>
  );
}

export { CommentThread, buildCommentTree, type CommentNode, type CommentThreadProps };
