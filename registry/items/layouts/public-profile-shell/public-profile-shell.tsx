"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { ProfileHeader, type ProfileHeaderProps } from "../../blocks/profile-header/profile-header";
import type { ActivityPubActor } from "../../lib/activitypub/activitypub";
import { sampleAuthor, sampleCounts } from "../../lib/social-sample-data/social-sample-data";

type PublicProfileShellProps = {
  actor?: ActivityPubActor;
  brand?: { name: string; href?: string };
  signInHref?: string;
  /** Rail content, rendered alongside `children` in a two-column layout at `lg` and up. */
  aside?: React.ReactNode;
  /** Places `aside` before `children` on wide screens. */
  asideFirst?: boolean;
  children?: React.ReactNode;
  className?: string;
} & Pick<
  ProfileHeaderProps,
  | "counts"
  | "tabs"
  | "defaultTab"
  | "onFollow"
  | "onUnfollow"
  | "onMessage"
  | "includeJsonLd"
  | "locale"
>;

/**
 * Layout for a signed-out visitor viewing an actor's public profile: a
 * minimal top bar, the `ProfileHeader` block, and a two-column area for the
 * timeline plus an optional rail.
 *
 * `viewer` is intentionally left out of `ProfileHeader` here since the
 * visitor isn't signed in — pass `onFollow`/`onUnfollow` that redirect to
 * `signInHref` if you want the follow control to gate on sign-in.
 */
function PublicProfileShell({
  actor = sampleAuthor,
  brand = { name: "Uptoolkit", href: "#" },
  signInHref = "#",
  counts = sampleCounts.author,
  tabs,
  defaultTab,
  onFollow,
  onUnfollow,
  onMessage,
  includeJsonLd = true,
  locale,
  aside,
  asideFirst = false,
  children,
  className,
}: PublicProfileShellProps) {
  return (
    <div className={cn("min-h-svh bg-muted/40", className)}>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <a
            href={brand.href ?? "#"}
            className="flex shrink-0 items-center gap-2 font-semibold tracking-tight"
          >
            {brand.name}
          </a>
          <Button
            size="sm"
            nativeButton={false}
            render={<a href={signInHref} />}
            className="ml-auto"
          >
            Sign in
          </Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
        <ProfileHeader
          actor={actor}
          counts={counts}
          tabs={tabs}
          defaultTab={defaultTab}
          onFollow={onFollow}
          onUnfollow={onUnfollow}
          onMessage={onMessage}
          includeJsonLd={includeJsonLd}
          locale={locale}
        />

        <div className="flex flex-col gap-6 lg:flex-row">
          <main className="min-w-0 flex-1">{children}</main>

          {aside ? (
            <aside
              className={cn(
                "flex w-full shrink-0 flex-col gap-4 lg:w-80",
                asideFirst && "lg:order-first",
              )}
            >
              {aside}
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { PublicProfileShell, type PublicProfileShellProps };
