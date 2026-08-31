import { IconLock, IconRosetteDiscountCheckFilled } from "@tabler/icons-react";
import * as React from "react";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import {
  getActorDisplayName,
  getActorHandle,
  getActorInitials,
  type ActivityPubActor,
} from "../../lib/activitypub/activitypub";

type ActorPresence = "online" | "away" | "offline";

const presenceStyles: Record<Exclude<ActorPresence, "offline">, string> = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
};

type ActorAvatarProps = Omit<React.ComponentProps<typeof Avatar>, "children"> & {
  actor: ActivityPubActor;
  size?: "sm" | "default" | "lg";
  /** Renders the coloured presence dot. `offline` renders nothing. */
  presence?: ActorPresence;
  /** Shows a check badge, for a verified `rel="me"` link or local account. */
  verified?: boolean;
  /** Shows a lock badge when the actor manually approves followers. */
  showLock?: boolean;
};

/**
 * Avatar for an ActivityPub actor.
 *
 * The image comes from the actor's `icon`, with initials from `name` or
 * `preferredUsername` as the fallback. `alt` is left empty and the handle is
 * exposed through `aria-label` so screen readers announce the actor once.
 */
function ActorAvatar({
  actor,
  size = "default",
  presence = "offline",
  verified = false,
  showLock = false,
  className,
  ...props
}: ActorAvatarProps) {
  const displayName = getActorDisplayName(actor);
  const lock = showLock && actor.manuallyApprovesFollowers;

  return (
    <Avatar
      size={size}
      className={cn("shrink-0", className)}
      aria-label={`${displayName} ${getActorHandle(actor)}`}
      itemProp="image"
      {...props}
    >
      {actor.icon?.url ? <AvatarImage src={actor.icon.url} alt={actor.icon.name ?? ""} /> : null}
      <AvatarFallback aria-hidden="true">{getActorInitials(actor)}</AvatarFallback>
      {verified ? (
        <AvatarBadge className="bg-sky-500 text-white" aria-hidden="true">
          <IconRosetteDiscountCheckFilled />
        </AvatarBadge>
      ) : lock ? (
        <AvatarBadge className="bg-muted-foreground text-background" aria-hidden="true">
          <IconLock />
        </AvatarBadge>
      ) : presence !== "offline" ? (
        <AvatarBadge className={presenceStyles[presence]} aria-hidden="true" />
      ) : null}
    </Avatar>
  );
}

type ActorAvatarGroupProps = React.ComponentProps<typeof AvatarGroup> & {
  actors: readonly ActivityPubActor[];
  size?: "sm" | "default" | "lg";
  /** Avatars rendered before collapsing the rest into a `+n` chip. */
  max?: number;
  /** Total participants, when it exceeds the actors you were able to load. */
  total?: number;
};

/** Overlapping avatars for reaction, participant, and mutual-friend rows. */
function ActorAvatarGroup({
  actors,
  size = "sm",
  max = 4,
  total,
  className,
  ...props
}: ActorAvatarGroupProps) {
  const visible = actors.slice(0, max);
  const remainder = (total ?? actors.length) - visible.length;

  return (
    <AvatarGroup className={className} {...props}>
      {visible.map((actor) => (
        <ActorAvatar key={actor.id} actor={actor} size={size} />
      ))}
      {remainder > 0 ? (
        <AvatarGroupCount
          className={size === "sm" ? "size-6 text-xs" : size === "lg" ? "size-10" : "size-8"}
        >
          +{remainder}
        </AvatarGroupCount>
      ) : null}
    </AvatarGroup>
  );
}

export {
  ActorAvatar,
  ActorAvatarGroup,
  type ActorAvatarGroupProps,
  type ActorAvatarProps,
  type ActorPresence,
};
