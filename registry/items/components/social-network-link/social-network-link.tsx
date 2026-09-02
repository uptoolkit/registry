"use client";

import { IconExternalLink, IconRosetteDiscountCheckFilled } from "@tabler/icons-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  getProfileUsername,
  getSocialNetworkPlatform,
  type SocialNetworkId,
  type SocialNetworkProfile,
} from "../../lib/social-networks/social-networks";
import { GrokIcon } from "../../lib/social-networks/social-network-icons";

type SocialNetworkLinkVariant = "icon" | "button" | "row" | "chip";

type SocialNetworkLinkProps = Omit<React.ComponentProps<"a">, "children" | "href"> & {
  profile: SocialNetworkProfile;
  variant?: SocialNetworkLinkVariant;
  showLabel?: boolean;
  showUsername?: boolean;
  className?: string;
};

function SocialNetworkIcon({
  network,
  className,
}: {
  network: SocialNetworkId;
  className?: string;
}) {
  if (network === "grok") {
    return <GrokIcon className={className} />;
  }

  const platform = getSocialNetworkPlatform(network);
  const Icon = platform?.icon;

  return Icon ? <Icon aria-hidden="true" className={className} /> : null;
}

/**
 * Branded outbound link to one social network profile.
 *
 * `icon` renders a circular brand button, `row` is a LinkedIn-style labelled
 * row, and `chip` is the compact Grok-style pill.
 */
function SocialNetworkLink({
  profile,
  variant = "icon",
  showLabel = true,
  showUsername = true,
  className,
  ...props
}: SocialNetworkLinkProps) {
  const platform = getSocialNetworkPlatform(profile.network);
  const label = profile.label ?? platform?.label ?? profile.network;
  const username =
    profile.username ?? getProfileUsername(profile.url, profile.network) ?? profile.url;
  const surfaceClass = platform?.surfaceClass ?? "bg-muted hover:bg-muted/80";
  const onSurfaceClass = platform?.onSurfaceClass ?? "text-foreground";

  if (variant === "icon") {
    return (
      <a
        href={profile.url}
        target="_blank"
        rel="me noopener noreferrer"
        aria-label={`${label}${username ? `: ${username}` : ""}`}
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-full transition-colors",
          surfaceClass,
          onSurfaceClass,
          className,
        )}
        {...props}
      >
        <SocialNetworkIcon network={profile.network} className="size-5" />
      </a>
    );
  }

  if (variant === "chip") {
    return (
      <a
        href={profile.url}
        target="_blank"
        rel="me noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-sm font-medium shadow-xs transition-colors hover:bg-muted",
          className,
        )}
        {...props}
      >
        <SocialNetworkIcon network={profile.network} className="size-4" />
        <span>{showUsername ? username : label}</span>
        {profile.verified ? (
          <IconRosetteDiscountCheckFilled
            aria-label="Verified"
            className="size-3.5 text-sky-500"
          />
        ) : null}
      </a>
    );
  }

  if (variant === "row") {
    return (
      <a
        href={profile.url}
        target="_blank"
        rel="me noopener noreferrer"
        className={cn(
          "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/60",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-md",
            surfaceClass,
            onSurfaceClass,
          )}
        >
          <SocialNetworkIcon network={profile.network} className="size-5" />
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          {showLabel ? (
            <span className="flex items-center gap-1 text-sm font-semibold">
              {label}
              {profile.verified ? (
                <IconRosetteDiscountCheckFilled
                  aria-label="Verified"
                  className="size-3.5 text-sky-500"
                />
              ) : null}
            </span>
          ) : null}
          {showUsername ? (
            <span className="truncate text-sm text-muted-foreground">{username}</span>
          ) : null}
        </span>

        <IconExternalLink aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      </a>
    );
  }

  return (
    <Button
      nativeButton={false}
      render={
        <a
          href={profile.url}
          target="_blank"
          rel="me noopener noreferrer"
          className={cn("gap-2", className)}
          {...props}
        />
      }
      variant="outline"
      size="sm"
    >
      <SocialNetworkIcon network={profile.network} className="size-4" />
      {showLabel ? label : null}
      {showUsername ? (
        <Badge variant="secondary" className="font-normal">
          {username}
        </Badge>
      ) : null}
    </Button>
  );
}

export { SocialNetworkLink, type SocialNetworkLinkProps, type SocialNetworkLinkVariant };
