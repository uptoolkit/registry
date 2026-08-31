/** The person the profile page is about. */
export type Profile = {
  name: string;
  handle: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  initials: string;
  location: string;
  joinedAt: string;
  website: string;
  pronouns: string;
  skills: readonly string[];
  stats: readonly ProfileStat[];
};

export type ProfileStat = {
  label: string;
  value: string;
};

export type ProfileActivity = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  kind: "shipped" | "wrote" | "spoke" | "joined";
};

export type ProfileProject = {
  id: string;
  name: string;
  description: string;
  role: string;
  status: "Active" | "Archived";
};

export const sampleProfile: Profile = {
  name: "Rowan Ellis",
  handle: "rowan",
  headline: "Design engineer, building tools for other builders",
  bio: "I work on the seam between design systems and the runtime that renders them. Mostly TypeScript, occasionally Rust, always too many browser tabs.",
  avatarUrl: "https://github.com/shadcn.png",
  initials: "RE",
  location: "Copenhagen, DK",
  joinedAt: "March 2021",
  website: "rowan.example.com",
  pronouns: "they/them",
  skills: ["Design systems", "TypeScript", "Accessibility", "Rust", "Prototyping"],
  stats: [
    { label: "Projects", value: "18" },
    { label: "Followers", value: "2.4k" },
    { label: "Following", value: "312" },
  ],
};

export const sampleActivity: readonly ProfileActivity[] = [
  {
    id: "activity-1",
    title: "Shipped tokens v4",
    detail: "Migrated every color token to OKLCH and dropped the legacy palette.",
    timestamp: "2 days ago",
    kind: "shipped",
  },
  {
    id: "activity-2",
    title: "Wrote “Stop nesting your primitives”",
    detail: "A short case against three-deep component wrappers in design systems.",
    timestamp: "1 week ago",
    kind: "wrote",
  },
  {
    id: "activity-3",
    title: "Spoke at NordicJS",
    detail: "Thirty minutes on rendering strategies and the cost of hydration.",
    timestamp: "3 weeks ago",
    kind: "spoke",
  },
  {
    id: "activity-4",
    title: "Joined the accessibility working group",
    detail: "Helping review component RFCs against WCAG 2.2.",
    timestamp: "2 months ago",
    kind: "joined",
  },
];

export const sampleProjects: readonly ProfileProject[] = [
  {
    id: "project-1",
    name: "Palette",
    description: "A perceptual color scale generator with contrast guardrails built in.",
    role: "Maintainer",
    status: "Active",
  },
  {
    id: "project-2",
    name: "Runlist",
    description: "Task runner that reads your package scripts and renders them as a TUI.",
    role: "Contributor",
    status: "Active",
  },
  {
    id: "project-3",
    name: "Slate",
    description: "An early static site generator, kept online for the people still using it.",
    role: "Maintainer",
    status: "Archived",
  },
];

const activityKindLabels = {
  shipped: "Shipped",
  wrote: "Wrote",
  spoke: "Spoke",
  joined: "Joined",
} as const satisfies Record<ProfileActivity["kind"], string>;

export function getActivityKindLabel(kind: ProfileActivity["kind"]): string {
  return activityKindLabels[kind];
}
