"use client";

import { IconCheck, IconClock, IconPlus, IconUserMinus } from "@tabler/icons-react";
import * as React from "react";

import { Button } from "@/components/ui/button";

import {
  createFollowActivity,
  createUndoActivity,
  getActorDisplayName,
  type ActivityPubActivity,
  type ActivityPubActor,
} from "../../lib/activitypub/activitypub";

/** Mirrors the ActivityPub follow lifecycle: Follow -> Accept, or Undo. */
type FollowState = "none" | "requested" | "following";

type FollowButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "children" | "onClick" | "value" | "defaultValue"
> & {
  /** The actor being followed. */
  actor: ActivityPubActor;
  /** The signed-in actor. Required to build a deliverable activity. */
  viewer?: ActivityPubActor;
  /** Controlled state. Omit to let the button manage its own state. */
  state?: FollowState;
  defaultState?: FollowState;
  onStateChange?: (state: FollowState) => void;
  /**
   * Called with the `Follow` activity to POST to the viewer's outbox. Resolve to
   * `false` to roll the optimistic state back.
   */
  onFollow?: (activity: ActivityPubActivity<string>) => void | boolean | Promise<void | boolean>;
  /** Called with the `Undo` activity that retracts the follow. */
  onUnfollow?: (
    activity: ActivityPubActivity<ActivityPubActivity<string>>,
  ) => void | boolean | Promise<void | boolean>;
  /** Swaps the following label for "Unfollow" on hover and focus. */
  showUnfollowOnHover?: boolean;
};

const stateLabels: Record<FollowState, string> = {
  none: "Follow",
  requested: "Requested",
  following: "Following",
};

/**
 * Follow control for an ActivityPub actor.
 *
 * Follows are optimistic: the label updates immediately, then reverts if the
 * handler resolves to `false`. Actors with `manuallyApprovesFollowers` move to
 * `requested` instead of `following`, matching the server's Accept flow.
 */
function FollowButton({
  actor,
  viewer,
  state: controlledState,
  defaultState = "none",
  onStateChange,
  onFollow,
  onUnfollow,
  showUnfollowOnHover = true,
  className,
  disabled,
  size = "sm",
  ...props
}: FollowButtonProps) {
  const [uncontrolledState, setUncontrolledState] = React.useState<FollowState>(defaultState);
  const [pending, setPending] = React.useState(false);
  const [intentVisible, setIntentVisible] = React.useState(false);

  const state = controlledState ?? uncontrolledState;
  const isFollowing = state === "following" || state === "requested";
  /** Track the sent Follow so Undo can reference the exact activity id. */
  const followActivityRef = React.useRef<ActivityPubActivity<string> | null>(null);

  const commitState = React.useCallback(
    (next: FollowState) => {
      if (controlledState === undefined) {
        setUncontrolledState(next);
      }

      onStateChange?.(next);
    },
    [controlledState, onStateChange],
  );

  const handleClick = React.useCallback(async () => {
    if (pending) {
      return;
    }

    const previous = state;
    const next: FollowState = isFollowing
      ? "none"
      : actor.manuallyApprovesFollowers
        ? "requested"
        : "following";

    commitState(next);
    setPending(true);

    try {
      if (!viewer) {
        return;
      }

      if (isFollowing) {
        const follow =
          followActivityRef.current ?? createFollowActivity({ actor: viewer, object: actor });
        const result = await onUnfollow?.(createUndoActivity({ actor: viewer, activity: follow }));

        followActivityRef.current = null;

        if (result === false) {
          commitState(previous);
        }

        return;
      }

      const follow = createFollowActivity({ actor: viewer, object: actor });

      followActivityRef.current = follow;

      const result = await onFollow?.(follow);

      if (result === false) {
        followActivityRef.current = null;
        commitState(previous);
      }
    } finally {
      setPending(false);
    }
  }, [actor, commitState, isFollowing, onFollow, onUnfollow, pending, state, viewer]);

  const showUnfollowIntent = showUnfollowOnHover && isFollowing && intentVisible;
  const label = showUnfollowIntent ? "Unfollow" : stateLabels[state];
  const Icon = showUnfollowIntent
    ? IconUserMinus
    : state === "following"
      ? IconCheck
      : state === "requested"
        ? IconClock
        : IconPlus;

  return (
    <Button
      type="button"
      size={size}
      variant={isFollowing ? "outline" : "default"}
      aria-pressed={isFollowing}
      aria-label={`${label} ${getActorDisplayName(actor)}`}
      disabled={disabled || pending}
      className={className}
      onClick={() => void handleClick()}
      onMouseEnter={() => setIntentVisible(true)}
      onMouseLeave={() => setIntentVisible(false)}
      onFocus={() => setIntentVisible(true)}
      onBlur={() => setIntentVisible(false)}
      {...props}
    >
      <Icon aria-hidden="true" />
      {label}
    </Button>
  );
}

export { FollowButton, type FollowButtonProps, type FollowState };
