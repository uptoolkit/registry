"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  sampleSocialProfiles,
  type SocialNetworkProfile,
} from "../../lib/social-networks/social-networks";
import {
  SocialNetworkLink,
  type SocialNetworkLinkVariant,
} from "../social-network-link/social-network-link";

/**
 * Display style inspired by each network's profile UI.
 *
 * - `facebook` — circular brand icon buttons in a horizontal row
 * - `linkedin` — labelled rows with external-link affordance
 * - `grok` — compact chips with monospace handles
 */
type UserSocialNetworksVariant = "facebook" | "linkedin" | "grok";

const variantConfig = {
  facebook: {
    heading: "Social profiles",
    linkVariant: "icon",
    listClass: "flex flex-wrap gap-2",
    showCard: false,
  },
  linkedin: {
    heading: "Contact info",
    linkVariant: "row",
    listClass: "flex flex-col gap-2",
    showCard: true,
  },
  grok: {
    heading: "Elsewhere",
    linkVariant: "chip",
    listClass: "flex flex-wrap gap-2",
    showCard: false,
  },
} as const satisfies Record<
  UserSocialNetworksVariant,
  {
    heading: string;
    linkVariant: SocialNetworkLinkVariant;
    listClass: string;
    showCard: boolean;
  }
>;

type UserSocialNetworksProps = Omit<React.ComponentProps<"section">, "children"> & {
  profiles?: readonly SocialNetworkProfile[];
  /** `facebook`, `linkedin`, or `grok` display style. */
  variant?: UserSocialNetworksVariant;
  heading?: string;
  /** Wrap LinkedIn-style rows in a card. Ignored for `facebook` and `grok`. */
  bordered?: boolean;
};

/**
 * Renders a user's external social network profiles.
 *
 * Pass `profiles` from your user model or derive them from ActivityPub
 * `attachment` PropertyValue rows with
 * `socialProfilesFromPropertyValues`. Each variant mirrors the interaction
 * pattern of the network it is named after while staying themeable inside any
 * shadcn project.
 */
function UserSocialNetworks({
  profiles = sampleSocialProfiles,
  variant = "facebook",
  heading,
  bordered,
  className,
  ...props
}: UserSocialNetworksProps) {
  const config = variantConfig[variant];
  const label = heading ?? config.heading;
  const showCard = bordered ?? config.showCard;

  if (profiles.length === 0) {
    return null;
  }

  const list = (
    <ul className={cn("m-0 list-none p-0", config.listClass)}>
      {profiles.map((profile) => (
        <li key={`${profile.network}-${profile.url}`}>
          <SocialNetworkLink
            profile={profile}
            variant={config.linkVariant}
            showLabel={variant !== "grok"}
            showUsername
            className={variant === "grok" ? "font-mono text-xs tracking-tight" : undefined}
          />
        </li>
      ))}
    </ul>
  );

  if (!showCard) {
    return (
      <section aria-label={label} className={cn("flex flex-col gap-3", className)} {...props}>
        <h3 className="m-0 text-sm font-semibold">{label}</h3>
        {list}
      </section>
    );
  }

  return (
    <section aria-label={label} className={className} {...props}>
      <Card className="gap-3 py-4">
        <CardHeader>
          <CardTitle className="text-base">{label}</CardTitle>
        </CardHeader>
        <CardContent>{list}</CardContent>
      </Card>
    </section>
  );
}

export { UserSocialNetworks, type UserSocialNetworksProps, type UserSocialNetworksVariant };
