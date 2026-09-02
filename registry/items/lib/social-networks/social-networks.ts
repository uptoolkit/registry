/**
 * Social network platform definitions and profile link helpers.
 *
 * Models external profiles the way ActivityPub `attachment` PropertyValue rows
 * often carry them — a label plus URL — while adding enough structure for
 * branded UI components to render Facebook, LinkedIn, and Grok links without
 * hard-coding platform knowledge in every profile.
 */

import type { Icon } from "@tabler/icons-react";
import { IconBrandFacebook, IconBrandLinkedin } from "@tabler/icons-react";

/** Supported social network identifiers. Extend with any string at runtime. */
type SocialNetworkId = "facebook" | "linkedin" | "grok" | (string & {});

type SocialNetworkProfile = {
  /** Platform identifier, for example `facebook` or `linkedin`. */
  network: SocialNetworkId;
  /** Canonical profile URL. */
  url: string;
  /** Handle shown in the UI when it differs from the URL path. */
  username?: string;
  /** Overrides the platform label, for example a custom link title. */
  label?: string;
  /** Renders a verified badge when the link has been confirmed. */
  verified?: boolean;
};

type SocialNetworkPlatform = {
  id: SocialNetworkId;
  label: string;
  hostnames: readonly string[];
  icon: Icon;
  /** Tailwind classes for brand-tinted surfaces. */
  surfaceClass: string;
  /** Tailwind classes for icon and text on brand surfaces. */
  onSurfaceClass: string;
  /** Hex brand color for inline styles when Tailwind tokens are not enough. */
  brandColor: string;
};

const platforms = {
  facebook: {
    id: "facebook",
    label: "Facebook",
    hostnames: ["facebook.com", "www.facebook.com", "m.facebook.com", "fb.com"],
    icon: IconBrandFacebook,
    surfaceClass: "bg-[#1877F2]/10 hover:bg-[#1877F2]/15",
    onSurfaceClass: "text-[#1877F2]",
    brandColor: "#1877F2",
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    hostnames: ["linkedin.com", "www.linkedin.com"],
    icon: IconBrandLinkedin,
    surfaceClass: "bg-[#0A66C2]/10 hover:bg-[#0A66C2]/15",
    onSurfaceClass: "text-[#0A66C2]",
    brandColor: "#0A66C2",
  },
  grok: {
    id: "grok",
    label: "Grok",
    hostnames: ["grok.com", "www.grok.com"],
    icon: IconBrandLinkedin,
    surfaceClass: "bg-foreground/5 hover:bg-foreground/10",
    onSurfaceClass: "text-foreground",
    brandColor: "#111111",
  },
} as const satisfies Record<"facebook" | "linkedin" | "grok", SocialNetworkPlatform>;

/** Built-in platforms keyed by id. Unknown ids fall back to a generic link row. */
const platformById = new Map<string, SocialNetworkPlatform>(
  Object.values(platforms).map((platform) => [platform.id, platform]),
);

function getSocialNetworkPlatform(network: SocialNetworkId): SocialNetworkPlatform | undefined {
  return platformById.get(network);
}

/** Reads a hostname from a profile URL, or returns `undefined` when invalid. */
function getProfileHostname(url: string): string | undefined {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

/** Guesses the platform from a profile URL. */
function detectSocialNetwork(url: string): SocialNetworkId | undefined {
  const hostname = getProfileHostname(url);

  if (!hostname) {
    return undefined;
  }

  for (const platform of platformById.values()) {
    if (platform.hostnames.some((candidate) => hostname === candidate || hostname.endsWith(`.${candidate}`))) {
      return platform.id;
    }
  }

  if (hostname.includes("grok")) {
    return "grok";
  }

  return undefined;
}

/** Pulls a display handle from common profile URL shapes. */
function getProfileUsername(url: string, network?: SocialNetworkId): string | undefined {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    const segments = parsed.pathname.split("/").filter(Boolean);

    if (network === "linkedin" && segments[0] === "in" && segments[1]) {
      return segments[1];
    }

    if (network === "facebook" && segments[0]) {
      return segments[0];
    }

    if ((network === "grok" || parsed.hostname.includes("x.com")) && segments[0]) {
      return `@${segments[0]}`;
    }

    return segments.at(-1) ?? parsed.hostname;
  } catch {
    return undefined;
  }
}

/** Normalises loose user input into a canonical profile URL. */
function buildSocialNetworkUrl(network: SocialNetworkId, value: string): string {
  const trimmed = value.trim();

  if (/^https?:\/\//iu.test(trimmed)) {
    return trimmed;
  }

  const handle = trimmed.replace(/^@/u, "");

  switch (network) {
    case "facebook":
      return `https://www.facebook.com/${handle}`;
    case "linkedin":
      return `https://www.linkedin.com/in/${handle}`;
    case "grok":
      return `https://grok.com/@${handle}`;
    default:
      return trimmed;
  }
}

/** Maps ActivityPub PropertyValue rows into social profiles when possible. */
function socialProfilesFromPropertyValues(
  fields: readonly { name: string; value: string; verifiedAt?: string | null }[],
): SocialNetworkProfile[] {
  return fields.flatMap((field) => {
    const network = detectSocialNetwork(field.value) ?? field.name.toLowerCase();
    const platform = getSocialNetworkPlatform(network);

    if (!platform && !/^https?:\/\//iu.test(field.value)) {
      return [];
    }

    const url = /^https?:\/\//iu.test(field.value)
      ? field.value
      : buildSocialNetworkUrl(network, field.value);

    return [
      {
        network,
        url,
        label: field.name,
        username: getProfileUsername(url, network),
        verified: Boolean(field.verifiedAt),
      },
    ];
  });
}

const sampleSocialProfiles: readonly SocialNetworkProfile[] = [
  {
    network: "facebook",
    url: "https://www.facebook.com/mira.halvorsen",
    username: "mira.halvorsen",
    verified: true,
  },
  {
    network: "linkedin",
    url: "https://www.linkedin.com/in/mira-halvorsen",
    username: "mira-halvorsen",
    verified: true,
  },
  {
    network: "grok",
    url: "https://grok.com/@mira_maps",
    username: "@mira_maps",
  },
];

export {
  buildSocialNetworkUrl,
  detectSocialNetwork,
  getProfileHostname,
  getProfileUsername,
  getSocialNetworkPlatform,
  platforms,
  sampleSocialProfiles,
  socialProfilesFromPropertyValues,
  type SocialNetworkId,
  type SocialNetworkPlatform,
  type SocialNetworkProfile,
};
