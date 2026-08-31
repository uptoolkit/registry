"use client";

import { IconSearch, IconUsersGroup } from "@tabler/icons-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { ActorCard } from "../../components/actor-card/actor-card";
import type { FollowState } from "../../components/follow-button/follow-button";
import { JsonLd } from "../../components/json-ld/json-ld";
import {
  formatCompactNumber,
  getActorDisplayName,
  getActorHandle,
  getCollectionCount,
  getCollectionItems,
  toPlainText,
  type ActivityPubActor,
  type ActivityPubCollection,
} from "../../lib/activitypub/activitypub";
import { toActorListJsonLd } from "../../lib/schema-org/schema-org";
import { sampleFollowers } from "../../lib/social-sample-data/social-sample-data";

const columnClasses: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

type ActorGridProps = Omit<React.ComponentProps<"section">, "children"> & {
  /** A `followers`, `following`, or suggestions collection. */
  actors?: ActivityPubCollection<ActivityPubActor> | readonly ActivityPubActor[];
  heading?: string;
  description?: string;
  /** Follow state per actor id, so the grid can show mixed relationships. */
  followStates?: Readonly<Record<string, FollowState>>;
  onFollowStateChange?: (actor: ActivityPubActor, state: FollowState) => void;
  onMessage?: (actor: ActivityPubActor) => void;
  /** Card layout: `card` stacks, `row` renders compact list rows. */
  variant?: "card" | "row";
  columns?: 1 | 2 | 3 | 4;
  /** Show the client-side name and handle filter. */
  searchable?: boolean;
  /** Actors shown before the "show all" control. */
  initialCount?: number;
  emptyState?: React.ReactNode;
  /** Emits a Schema.org `ItemList` of `Person` nodes. */
  includeJsonLd?: boolean;
  /** BCP 47 locale for dates and counts. Must match on server and client. */
  locale?: string;
};

/**
 * People grid for an ActivityPub actor collection.
 *
 * Works for followers, following, and suggestion lists. The total comes from the
 * collection's `totalItems` when present, so a paginated collection still
 * reports its real size, and the list is described as a Schema.org `ItemList`.
 */
function ActorGrid({
  actors = sampleFollowers,
  heading = "Followers",
  description,
  followStates,
  onFollowStateChange,
  onMessage,
  variant = "card",
  columns = 3,
  searchable = false,
  initialCount,
  emptyState,
  includeJsonLd = true,
  locale,
  className,
  ...props
}: ActorGridProps) {
  const [query, setQuery] = React.useState("");
  const [expanded, setExpanded] = React.useState(false);
  const searchId = React.useId();

  const items = React.useMemo(() => getCollectionItems(actors), [actors]);
  const total = getCollectionCount(actors);

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) {
      return items;
    }

    return items.filter((actor) =>
      [getActorDisplayName(actor), getActorHandle(actor), toPlainText(actor.summary)]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [items, query]);

  const limit = initialCount ?? filtered.length;
  const visible = expanded ? filtered : filtered.slice(0, limit);
  const hidden = filtered.length - visible.length;

  return (
    <section
      aria-label={heading}
      className={cn("flex w-full flex-col gap-3", className)}
      {...props}
    >
      {includeJsonLd ? <JsonLd data={toActorListJsonLd(items, { name: heading })} /> : null}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 flex items-center gap-2 text-lg font-semibold">
            <IconUsersGroup aria-hidden="true" className="size-5" />
            {heading}
            {total > 0 ? (
              <span className="text-sm font-normal text-muted-foreground tabular-nums">
                {formatCompactNumber(total, locale)}
              </span>
            ) : null}
          </h2>
          {description ? <p className="m-0 text-sm text-muted-foreground">{description}</p> : null}
        </div>

        {searchable ? (
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor={searchId}>
              Filter {heading}
            </label>
            <div className="relative">
              <IconSearch
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id={searchId}
                type="search"
                value={query}
                placeholder="Search people"
                className="w-48 pl-8"
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {emptyState ?? (query ? `No people match "${query}".` : "No people to show yet.")}
        </div>
      ) : (
        <ul
          className={cn(
            "m-0 grid list-none gap-3 p-0",
            variant === "row" ? "grid-cols-1" : (columnClasses[columns] ?? columnClasses[3]),
          )}
        >
          {visible.map((actor) => (
            <li key={actor.id}>
              <ActorCard
                actor={actor}
                variant={variant}
                showFields={variant === "card"}
                includeJsonLd={false}
                locale={locale}
                followState={followStates?.[actor.id]}
                onFollowStateChange={(state) => onFollowStateChange?.(actor, state)}
                {...(onMessage ? { onMessage } : {})}
              />
            </li>
          ))}
        </ul>
      )}

      {hidden > 0 ? (
        <Button
          type="button"
          variant="outline"
          className="self-center"
          onClick={() => setExpanded(true)}
        >
          Show all {filtered.length} people
        </Button>
      ) : null}
    </section>
  );
}

export { ActorGrid, type ActorGridProps };
