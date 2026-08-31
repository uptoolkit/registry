"use client";

import {
  IconBookmark,
  IconBookmarkFilled,
  IconHeart,
  IconHeartFilled,
  IconMessageCircle,
  IconRepeat,
  IconShare3,
} from "@tabler/icons-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  createAnnounceActivity,
  createLikeActivity,
  createUndoActivity,
  formatCompactNumber,
  getCollectionCount,
  type ActivityPubActivity,
  type ActivityPubActor,
  type ActivityPubObject,
} from "../../lib/activitypub/activitypub";

/**
 * Emoji reactions.
 *
 * The fediverse expresses these as `EmojiReact` (or `Like` carrying `content`),
 * so each kind is just an emoji paired with a label.
 */
type ReactionKind = {
  key: string;
  emoji: string;
  label: string;
};

const defaultReactionKinds: readonly ReactionKind[] = [
  { key: "like", emoji: "\u{1F44D}", label: "Like" },
  { key: "love", emoji: "\u2764\uFE0F", label: "Love" },
  { key: "care", emoji: "\u{1F917}", label: "Care" },
  { key: "haha", emoji: "\u{1F602}", label: "Haha" },
  { key: "wow", emoji: "\u{1F62E}", label: "Wow" },
  { key: "sad", emoji: "\u{1F622}", label: "Sad" },
  { key: "angry", emoji: "\u{1F621}", label: "Angry" },
];

type ReactionCounts = {
  likes?: number;
  shares?: number;
  replies?: number;
};

type ReactionViewerState = {
  /** Emoji when the viewer used a specific reaction, `true` for a plain Like. */
  liked?: boolean | string;
  shared?: boolean;
  bookmarked?: boolean;
};

type ReactionActivity = ActivityPubActivity;
type UndoReactionActivity = ActivityPubActivity<ReactionActivity>;

type ReactionBarProps = Omit<React.ComponentProps<"div">, "children"> & {
  object: ActivityPubObject;
  /** The signed-in actor. Without it the bar renders read-only counts. */
  viewer?: ActivityPubActor;
  /** Overrides the counts derived from the object's `likes`/`shares`/`replies`. */
  counts?: ReactionCounts;
  /** Controlled viewer state. Omit to let the bar manage it. */
  state?: ReactionViewerState;
  defaultState?: ReactionViewerState;
  onStateChange?: (state: ReactionViewerState) => void;
  onLike?: (activity: ReactionActivity) => void;
  onUnlike?: (activity: UndoReactionActivity) => void;
  onShare?: (activity: ReactionActivity) => void;
  onUnshare?: (activity: UndoReactionActivity) => void;
  onReply?: (object: ActivityPubObject) => void;
  /** Native share sheet is used when this is omitted. */
  onCopyLink?: (object: ActivityPubObject) => void;
  /** Emoji reaction picker. Pass `false` for a single Like button. */
  reactions?: readonly ReactionKind[] | false;
  showBookmark?: boolean;
  variant?: "default" | "compact";
  /** BCP 47 locale for counts. Must match on server and client. */
  locale?: string;
};

function getReactionKind(
  reactions: readonly ReactionKind[],
  liked: boolean | string | undefined,
): ReactionKind | undefined {
  if (typeof liked !== "string") {
    return undefined;
  }

  return reactions.find((reaction) => reaction.emoji === liked || reaction.key === liked);
}

/**
 * Like, boost, reply, and share controls for an ActivityPub object.
 *
 * Every interaction produces a real activity: `Like`/`EmojiReact` for
 * reactions, `Announce` for boosts, and `Undo` wrapping the original activity
 * when the viewer takes it back. Counts update optimistically.
 */
function ReactionBar({
  object,
  viewer,
  counts,
  state: controlledState,
  defaultState,
  onStateChange,
  onLike,
  onUnlike,
  onShare,
  onUnshare,
  onReply,
  onCopyLink,
  reactions = defaultReactionKinds,
  showBookmark = false,
  variant = "default",
  locale,
  className,
  ...props
}: ReactionBarProps) {
  const reactionKinds = reactions === false ? [] : reactions;
  const [uncontrolledState, setUncontrolledState] = React.useState<ReactionViewerState>(
    defaultState ?? {},
  );
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const state = controlledState ?? uncontrolledState;

  const baseCounts = React.useMemo<Required<ReactionCounts>>(
    () => ({
      likes: counts?.likes ?? getCollectionCount(object.likes),
      shares: counts?.shares ?? getCollectionCount(object.shares),
      replies: counts?.replies ?? getCollectionCount(object.replies),
    }),
    [counts?.likes, counts?.replies, counts?.shares, object.likes, object.replies, object.shares],
  );

  /** The incoming counts describe the object without the viewer's own action. */
  const initialState = React.useRef(defaultState ?? controlledState ?? {});
  const likeDelta = Number(Boolean(state.liked)) - Number(Boolean(initialState.current.liked));
  const shareDelta = Number(Boolean(state.shared)) - Number(Boolean(initialState.current.shared));

  const activityRef = React.useRef<{ like?: ReactionActivity; share?: ReactionActivity }>({});

  const commitState = React.useCallback(
    (next: ReactionViewerState) => {
      if (controlledState === undefined) {
        setUncontrolledState(next);
      }

      onStateChange?.(next);
    },
    [controlledState, onStateChange],
  );

  const handleLike = React.useCallback(
    (reaction?: ReactionKind) => {
      setPickerOpen(false);

      const alreadyReacted = Boolean(state.liked) && (!reaction || state.liked === reaction.emoji);

      if (alreadyReacted) {
        commitState({ ...state, liked: false });

        if (viewer && activityRef.current.like) {
          onUnlike?.(createUndoActivity({ actor: viewer, activity: activityRef.current.like }));
        }

        activityRef.current.like = undefined;
        return;
      }

      commitState({ ...state, liked: reaction?.emoji ?? true });

      if (!viewer) {
        return;
      }

      const activity = createLikeActivity({
        actor: viewer,
        object,
        ...(reaction ? { content: reaction.emoji } : {}),
      });

      activityRef.current.like = activity;
      onLike?.(activity);
    },
    [commitState, object, onLike, onUnlike, state, viewer],
  );

  const handleShare = React.useCallback(() => {
    if (state.shared) {
      commitState({ ...state, shared: false });

      if (viewer && activityRef.current.share) {
        onUnshare?.(createUndoActivity({ actor: viewer, activity: activityRef.current.share }));
      }

      activityRef.current.share = undefined;
      return;
    }

    commitState({ ...state, shared: true });

    if (!viewer) {
      return;
    }

    const activity = createAnnounceActivity({ actor: viewer, object });

    activityRef.current.share = activity;
    onShare?.(activity);
  }, [commitState, object, onShare, onUnshare, state, viewer]);

  const handleCopyLink = React.useCallback(() => {
    if (onCopyLink) {
      onCopyLink(object);
      return;
    }

    const url = object.url ?? object.id;

    if (typeof navigator !== "undefined" && "clipboard" in navigator) {
      void navigator.clipboard.writeText(url);
    }
  }, [object, onCopyLink]);

  const activeReaction = getReactionKind(reactionKinds, state.liked);
  const likeCount = Math.max(0, baseCounts.likes + likeDelta);
  const shareCount = Math.max(0, baseCounts.shares + shareDelta);
  const compact = variant === "compact";
  const buttonSize = compact ? "sm" : "default";

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        compact ? "text-xs" : "justify-between text-sm",
        className,
      )}
      {...props}
    >
      <div className="relative flex items-center">
        {reactionKinds.length > 0 && pickerOpen ? (
          <div
            role="menu"
            aria-label="Choose a reaction"
            className="absolute bottom-full left-0 z-20 mb-1 flex gap-0.5 rounded-full border bg-popover p-1 shadow-md"
            onMouseLeave={() => setPickerOpen(false)}
          >
            {reactionKinds.map((reaction) => (
              <button
                key={reaction.key}
                type="button"
                role="menuitem"
                title={reaction.label}
                aria-label={reaction.label}
                className="rounded-full px-1.5 py-0.5 text-lg transition-transform hover:scale-125 focus-visible:scale-125 focus-visible:outline-none"
                onClick={() => handleLike(reaction)}
              >
                <span aria-hidden="true">{reaction.emoji}</span>
              </button>
            ))}
          </div>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size={buttonSize}
          aria-pressed={Boolean(state.liked)}
          aria-label={activeReaction ? `${activeReaction.label} reaction` : "Like"}
          className={cn(state.liked && !activeReaction && "text-rose-600 dark:text-rose-400")}
          onClick={() => handleLike(activeReaction)}
          onContextMenu={(event) => {
            if (reactionKinds.length === 0) {
              return;
            }

            event.preventDefault();
            setPickerOpen(true);
          }}
          onMouseEnter={() => reactionKinds.length > 0 && setPickerOpen(true)}
        >
          {activeReaction ? (
            <span aria-hidden="true" className="text-base leading-none">
              {activeReaction.emoji}
            </span>
          ) : state.liked ? (
            <IconHeartFilled aria-hidden="true" />
          ) : (
            <IconHeart aria-hidden="true" />
          )}
          {likeCount > 0 ? formatCompactNumber(likeCount, locale) : "Like"}
        </Button>
      </div>

      <Button
        type="button"
        variant="ghost"
        size={buttonSize}
        aria-label="Reply"
        onClick={() => onReply?.(object)}
      >
        <IconMessageCircle aria-hidden="true" />
        {baseCounts.replies > 0 ? formatCompactNumber(baseCounts.replies, locale) : "Reply"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size={buttonSize}
        aria-pressed={Boolean(state.shared)}
        aria-label={state.shared ? "Undo boost" : "Boost"}
        className={cn(state.shared && "text-emerald-600 dark:text-emerald-400")}
        onClick={handleShare}
      >
        <IconRepeat aria-hidden="true" />
        {shareCount > 0 ? formatCompactNumber(shareCount, locale) : "Boost"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size={buttonSize}
        aria-label="Copy link to post"
        onClick={handleCopyLink}
      >
        <IconShare3 aria-hidden="true" />
        {compact ? null : "Share"}
      </Button>

      {showBookmark ? (
        <Button
          type="button"
          variant="ghost"
          size={buttonSize}
          aria-pressed={Boolean(state.bookmarked)}
          aria-label={state.bookmarked ? "Remove bookmark" : "Bookmark"}
          onClick={() => commitState({ ...state, bookmarked: !state.bookmarked })}
        >
          {state.bookmarked ? (
            <IconBookmarkFilled aria-hidden="true" />
          ) : (
            <IconBookmark aria-hidden="true" />
          )}
        </Button>
      ) : null}
    </div>
  );
}

export {
  ReactionBar,
  defaultReactionKinds,
  type ReactionBarProps,
  type ReactionCounts,
  type ReactionKind,
  type ReactionViewerState,
};
