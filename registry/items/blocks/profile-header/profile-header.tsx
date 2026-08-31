"use client";

import { IconCalendar, IconLink, IconMail, IconMapPin } from "@tabler/icons-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { ActorAvatar } from "../../components/actor-avatar/actor-avatar";
import { FollowButton, type FollowButtonProps } from "../../components/follow-button/follow-button";
import { JsonLd } from "../../components/json-ld/json-ld";
import {
  formatCompactNumber,
  formatPublishedDate,
  getActorDisplayName,
  getActorHandle,
  toPlainText,
  type ActivityPubActor,
} from "../../lib/activitypub/activitypub";
import { toProfilePageJsonLd, type SocialInteractionCounts } from "../../lib/schema-org/schema-org";
import { sampleAuthor, sampleCounts } from "../../lib/social-sample-data/social-sample-data";

/** Field names that get a matching icon instead of a plain label. */
const fieldIcons: Record<string, typeof IconLink> = {
  location: IconMapPin,
  website: IconLink,
  email: IconMail,
};

type ProfileTab = {
  value: string;
  label: string;
  /** Optional count rendered as a badge next to the label. */
  count?: number;
  content?: React.ReactNode;
};

type ProfileHeaderProps = Omit<React.ComponentProps<"header">, "children"> & {
  actor?: ActivityPubActor;
  /** The signed-in actor. Omit for a signed-out view. */
  viewer?: ActivityPubActor;
  counts?: SocialInteractionCounts;
  followState?: FollowButtonProps["state"];
  defaultFollowState?: FollowButtonProps["defaultState"];
  onFollow?: FollowButtonProps["onFollow"];
  onUnfollow?: FollowButtonProps["onUnfollow"];
  onMessage?: (actor: ActivityPubActor) => void;
  /** Tabs rendered under the header. Pass `[]` to render the header alone. */
  tabs?: readonly ProfileTab[];
  defaultTab?: string;
  /** Emits a Schema.org `ProfilePage` JSON-LD script. */
  includeJsonLd?: boolean;
  /** BCP 47 locale for dates and counts. Must match on server and client. */
  locale?: string;
};

const defaultTabs: readonly ProfileTab[] = [
  { value: "posts", label: "Posts" },
  { value: "replies", label: "Replies" },
  { value: "media", label: "Media" },
  { value: "about", label: "About" },
];

function ProfileStat({ label, value, locale }: { label: string; value: number; locale?: string }) {
  return (
    <div className="flex flex-row-reverse items-baseline gap-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="m-0 text-base font-semibold tabular-nums">
        {formatCompactNumber(value, locale)}
      </dd>
    </div>
  );
}

/**
 * Profile header for an ActivityPub actor.
 *
 * Cover art comes from the actor's `image`, the avatar from `icon`, and the
 * metadata rows from `attachment` PropertyValue fields, including Mastodon's
 * `verifiedAt` link verification. The whole block is described by a Schema.org
 * `ProfilePage` whose `mainEntity` is the actor.
 */
function ProfileHeader({
  actor = sampleAuthor,
  viewer,
  counts = sampleCounts.author,
  followState,
  defaultFollowState,
  onFollow,
  onUnfollow,
  onMessage,
  tabs = defaultTabs,
  defaultTab,
  includeJsonLd = true,
  locale,
  className,
  ...props
}: ProfileHeaderProps) {
  const displayName = getActorDisplayName(actor);
  const bio = toPlainText(actor.summary);
  const joined = formatPublishedDate(actor.published, locale === undefined ? {} : { locale });
  const fields = actor.attachment ?? [];
  const verified = fields.some((field) => Boolean(field.verifiedAt));
  const isSelf = viewer?.id === actor.id;

  const aboutPanel = (
    <dl className="m-0 grid gap-2 text-sm sm:grid-cols-2">
      {fields.map((field) => {
        const Icon = fieldIcons[field.name.toLowerCase()];

        return (
          <div key={field.name} className="flex flex-col gap-0.5 rounded-md border p-3">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {Icon ? <Icon aria-hidden="true" className="size-3.5" /> : null}
              {field.name}
            </dt>
            <dd
              className={cn(
                "m-0 font-medium",
                field.verifiedAt && "text-emerald-600 dark:text-emerald-400",
              )}
            >
              {toPlainText(field.value)}
              {field.verifiedAt ? <span className="sr-only"> (verified)</span> : null}
            </dd>
          </div>
        );
      })}
    </dl>
  );

  return (
    <header
      className={cn("w-full overflow-hidden rounded-xl border bg-card", className)}
      itemScope
      itemType="https://schema.org/ProfilePage"
      {...props}
    >
      {includeJsonLd ? <JsonLd data={toProfilePageJsonLd(actor, { counts })} /> : null}

      {actor.image?.url ? (
        <img
          src={actor.image.url}
          alt={actor.image.name ?? ""}
          className="h-32 w-full object-cover sm:h-48"
        />
      ) : (
        <div className="h-32 w-full bg-gradient-to-br from-muted to-accent sm:h-48" />
      )}

      <div
        className="flex flex-col gap-4 p-4 sm:p-6"
        itemProp="mainEntity"
        itemScope
        itemType={
          actor.type === "Organization" || actor.type === "Group"
            ? "https://schema.org/Organization"
            : "https://schema.org/Person"
        }
      >
        <meta itemProp="identifier" content={getActorHandle(actor).slice(1)} />

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="-mt-14 flex items-end gap-3 sm:-mt-20">
            <ActorAvatar
              actor={actor}
              size="lg"
              verified={verified}
              className="size-20 ring-4 ring-card sm:size-28"
            />
            <div className="flex flex-col pb-1">
              <h1 className="m-0 text-xl font-semibold sm:text-2xl" itemProp="name">
                {displayName}
              </h1>
              <span className="text-sm text-muted-foreground" itemProp="alternateName">
                {getActorHandle(actor)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {actor.manuallyApprovesFollowers ? <Badge variant="secondary">Approves</Badge> : null}
            {isSelf ? (
              <Button type="button" variant="outline" size="sm">
                Edit profile
              </Button>
            ) : (
              <>
                <FollowButton
                  actor={actor}
                  viewer={viewer}
                  state={followState}
                  defaultState={defaultFollowState}
                  onFollow={onFollow}
                  onUnfollow={onUnfollow}
                />
                {onMessage ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onMessage(actor)}
                    aria-label={`Message ${displayName}`}
                  >
                    <IconMail aria-hidden="true" />
                    Message
                  </Button>
                ) : null}
              </>
            )}
          </div>
        </div>

        {bio ? (
          <p className="m-0 max-w-prose text-sm" itemProp="description">
            {bio}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <dl className="m-0 flex flex-wrap gap-x-6 gap-y-1">
            {counts.posts === undefined ? null : (
              <ProfileStat label="Posts" value={counts.posts} locale={locale} />
            )}
            {counts.followers === undefined ? null : (
              <ProfileStat label="Followers" value={counts.followers} locale={locale} />
            )}
            {counts.following === undefined ? null : (
              <ProfileStat label="Following" value={counts.following} locale={locale} />
            )}
          </dl>

          {joined ? (
            <p className="m-0 flex items-center gap-1.5 text-sm text-muted-foreground">
              <IconCalendar aria-hidden="true" className="size-4" />
              Joined {joined}
              {actor.published ? <meta itemProp="foundingDate" content={actor.published} /> : null}
            </p>
          ) : null}
        </div>
      </div>

      {tabs.length > 0 ? (
        <>
          <Separator />
          <Tabs defaultValue={defaultTab ?? tabs[0].value} className="gap-0">
            <TabsList variant="line" className="w-full justify-start rounded-none px-4 sm:px-6">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                  {tab.count === undefined ? null : (
                    <Badge variant="secondary">{formatCompactNumber(tab.count, locale)}</Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="p-4 sm:p-6">
                {tab.content ?? (tab.value === "about" ? aboutPanel : null)}
              </TabsContent>
            ))}
          </Tabs>
        </>
      ) : null}
    </header>
  );
}

export { ProfileHeader, defaultTabs, type ProfileHeaderProps, type ProfileTab };
