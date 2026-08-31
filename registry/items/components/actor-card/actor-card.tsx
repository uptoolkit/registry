"use client";

import { IconCalendar, IconLink, IconMessage } from "@tabler/icons-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  formatCompactNumber,
  formatPublishedDate,
  getActorDisplayName,
  getActorHandle,
  toPlainText,
  type ActivityPubActor,
} from "../../lib/activitypub/activitypub";
import { toPersonJsonLd, type SocialInteractionCounts } from "../../lib/schema-org/schema-org";
import { ActorAvatar } from "../actor-avatar/actor-avatar";
import { FollowButton, type FollowButtonProps } from "../follow-button/follow-button";
import { JsonLd } from "../json-ld/json-ld";

type ActorCardProps = Omit<React.ComponentProps<typeof Card>, "children"> & {
  actor: ActivityPubActor;
  /** The signed-in actor, forwarded to the follow button. */
  viewer?: ActivityPubActor;
  /** Follower, following, and post counts shown in the stats row. */
  counts?: SocialInteractionCounts;
  followState?: FollowButtonProps["state"];
  defaultFollowState?: FollowButtonProps["defaultState"];
  onFollow?: FollowButtonProps["onFollow"];
  onUnfollow?: FollowButtonProps["onUnfollow"];
  onFollowStateChange?: FollowButtonProps["onStateChange"];
  onMessage?: (actor: ActivityPubActor) => void;
  /** `card` stacks the profile; `row` is a compact list item. */
  variant?: "card" | "row";
  /** Show the actor's `attachment` PropertyValue metadata rows. */
  showFields?: boolean;
  /** Emits a Schema.org `Person` (or `Organization`) JSON-LD script. */
  includeJsonLd?: boolean;
  hideFollow?: boolean;
  /** BCP 47 locale for dates and counts. Must match on server and client. */
  locale?: string;
};

function ActorStats({ counts, locale }: { counts: SocialInteractionCounts; locale?: string }) {
  const entries: [string, number | undefined][] = [
    ["Posts", counts.posts],
    ["Followers", counts.followers],
    ["Following", counts.following],
  ];
  const visible = entries.filter((entry): entry is [string, number] => entry[1] !== undefined);

  if (visible.length === 0) {
    return null;
  }

  return (
    <dl className="m-0 flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {visible.map(([label, value]) => (
        <div key={label} className="flex flex-row-reverse gap-1">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="m-0 font-semibold tabular-nums">{formatCompactNumber(value, locale)}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Profile summary card for an ActivityPub actor.
 *
 * Renders the actor's identity, bio, verified profile fields, and counts, with
 * Schema.org `Person`/`Organization` microdata inline. Verification comes from
 * the `verifiedAt` flag on the actor's `attachment` fields, matching how
 * Mastodon marks a confirmed `rel="me"` link.
 */
function ActorCard({
  actor,
  viewer,
  counts,
  followState,
  defaultFollowState,
  onFollow,
  onUnfollow,
  onFollowStateChange,
  onMessage,
  variant = "card",
  showFields = false,
  includeJsonLd = false,
  hideFollow = false,
  locale,
  className,
  ...props
}: ActorCardProps) {
  const isRow = variant === "row";
  const bio = toPlainText(actor.summary);
  const joined = formatPublishedDate(actor.published, locale === undefined ? {} : { locale });
  const isOrganization = actor.type === "Organization" || actor.type === "Group";
  const fields = showFields ? (actor.attachment ?? []) : [];
  const verified = (actor.attachment ?? []).some((field) => Boolean(field.verifiedAt));

  const follow = hideFollow ? null : (
    <FollowButton
      actor={actor}
      viewer={viewer}
      state={followState}
      defaultState={defaultFollowState}
      onFollow={onFollow}
      onUnfollow={onUnfollow}
      onStateChange={onFollowStateChange}
    />
  );

  return (
    <Card
      className={cn("w-full", isRow ? "gap-0 py-3" : "gap-3 py-4", className)}
      itemScope
      itemType={isOrganization ? "https://schema.org/Organization" : "https://schema.org/Person"}
      itemID={actor.id}
      {...props}
    >
      {includeJsonLd ? <JsonLd data={toPersonJsonLd(actor, { counts })} /> : null}
      <meta itemProp="identifier" content={getActorHandle(actor).slice(1)} />

      <CardContent
        className={cn("flex gap-3", isRow ? "items-center" : "flex-col items-start gap-2")}
      >
        <ActorAvatar actor={actor} size="lg" verified={verified} showLock />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <a href={actor.url ?? actor.id} className="font-semibold hover:underline" itemProp="url">
            <span itemProp="name">{getActorDisplayName(actor)}</span>
          </a>
          <span className="truncate text-sm text-muted-foreground" itemProp="alternateName">
            {getActorHandle(actor)}
          </span>

          {bio ? (
            <p className={cn("m-0 text-sm", isRow && "line-clamp-2")} itemProp="description">
              {bio}
            </p>
          ) : null}

          {counts ? <ActorStats counts={counts} locale={locale} /> : null}

          {fields.length > 0 ? (
            <dl className="m-0 mt-1 grid gap-1 text-sm">
              {fields.map((field) => (
                <div key={field.name} className="flex flex-wrap gap-x-2">
                  <dt className="text-muted-foreground">{field.name}</dt>
                  <dd
                    className={cn(
                      "m-0 flex items-center gap-1",
                      field.verifiedAt && "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    {field.verifiedAt ? (
                      <IconLink aria-label="Verified link" role="img" className="size-3.5" />
                    ) : null}
                    {toPlainText(field.value)}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {joined && !isRow ? (
            <p className="m-0 flex items-center gap-1 text-xs text-muted-foreground">
              <IconCalendar aria-hidden="true" className="size-3.5" />
              Joined {joined}
            </p>
          ) : null}
        </div>

        {isRow ? <div className="flex shrink-0 items-center gap-2">{follow}</div> : null}
      </CardContent>

      {isRow ? null : (
        <CardFooter className="gap-2">
          {follow}
          {onMessage ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onMessage(actor)}
              aria-label={`Message ${getActorDisplayName(actor)}`}
            >
              <IconMessage aria-hidden="true" />
              Message
            </Button>
          ) : null}
        </CardFooter>
      )}
    </Card>
  );
}

export { ActorCard, type ActorCardProps };
