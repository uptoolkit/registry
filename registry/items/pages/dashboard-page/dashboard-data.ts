import {
  IconBriefcase,
  IconBrandDiscord,
  IconBrandWhatsapp,
  IconBook2,
  IconBuildingStore,
  IconCertificate,
  IconClock,
  IconCreditCard,
  IconFolders,
  IconGift,
  IconId,
  IconLayoutGrid,
  IconLayoutKanban,
  IconRocket,
  IconSchool,
  IconSearch,
  IconSend,
  IconSettings,
  IconShieldCheck,
  IconTarget,
  IconTrophy,
  IconUser,
  IconUsers,
  IconUsersGroup,
  type Icon,
} from "@tabler/icons-react";

import type {
  DashboardShellLocale,
  DashboardShellNavGroup,
  DashboardShellUser,
  DashboardShellWorkspace,
} from "../../layouts/dashboard-shell/dashboard-shell";

/** Tint applied to an icon chip or tile. Keys map to classes in the page. */
export type DashboardTone = "orange" | "blue" | "green" | "amber" | "violet";

/** One tile in the quick actions card. */
export type DashboardQuickAction = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: Icon;
  tone: DashboardTone;
};

/** One counter in the stats row. */
export type DashboardStat = {
  id: string;
  label: string;
  value: number;
  icon: Icon;
  tone: DashboardTone;
};

/** A member card in the "new members" carousel. */
export type DashboardMember = {
  id: string;
  name: string;
  role: string;
  href: string;
  avatarUrl: string;
};

/**
 * Category an activity entry belongs to. Drives both the feed tabs and the
 * icon each row renders, so entries stay serializable across the server and
 * client boundary.
 */
export type DashboardActivityKind = "training" | "marketplace" | "job" | "member";

/** One row in the activity feed. */
export type DashboardActivityEntry = {
  id: string;
  kind: DashboardActivityKind;
  label: string;
  title: string;
  href: string;
  timestamp: string;
};

/** A chat or social channel in the community card. */
export type DashboardCommunityChannel = {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: Icon;
};

export const dashboardWorkspace: DashboardShellWorkspace = {
  id: "my-space",
  name: "My Space",
  meta: "Personal",
};

export const dashboardWorkspaces: readonly DashboardShellWorkspace[] = [
  dashboardWorkspace,
  { id: "co-labs", name: "Co-Labs", meta: "Cooperative" },
  { id: "atlas-collective", name: "Atlas Collective", meta: "Cooperative" },
];

export const dashboardUser: DashboardShellUser = {
  name: "Alex Moreau",
  email: "alex@example.com",
  avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=alex-moreau",
};

export const dashboardLocales: readonly DashboardShellLocale[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
];

export const dashboardNav: readonly DashboardShellNavGroup[] = [
  {
    label: "Explore",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: IconLayoutGrid, active: true },
      { label: "Marketplace", href: "/marketplace", icon: IconBuildingStore },
      { label: "Jobs", href: "/jobs", icon: IconBriefcase },
      { label: "Missions", href: "/missions", icon: IconTarget },
      { label: "Members", href: "/members", icon: IconUsers },
      { label: "Academy", href: "/academy", icon: IconSchool },
      { label: "Projects", href: "/projects", icon: IconFolders },
      { label: "Resources", href: "/resources", icon: IconBook2 },
    ],
  },
  {
    label: "My space",
    items: [
      { label: "Timesheet", href: "/timesheet", icon: IconClock },
      { label: "My teams", href: "/teams", icon: IconUsersGroup },
      { label: "My projects", href: "/my-projects", icon: IconLayoutKanban },
      { label: "My applications", href: "/applications", icon: IconSend },
      { label: "Referral program", href: "/referrals", icon: IconGift },
      { label: "Edit profile", href: "/profile", icon: IconUser },
      { label: "Billing", href: "/billing", icon: IconCreditCard },
      { label: "My shares", href: "/shares", icon: IconCertificate },
      { label: "Member card", href: "/member-card", icon: IconId },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Moderation", href: "/admin/moderation", icon: IconShieldCheck },
      { label: "Settings", href: "/admin/settings", icon: IconSettings },
    ],
  },
];

export const dashboardQuickActions: readonly DashboardQuickAction[] = [
  {
    id: "post-need",
    label: "Post a need",
    description: "Looking for talent?",
    href: "/marketplace/new",
    icon: IconSearch,
    tone: "orange",
  },
  {
    id: "post-job",
    label: "Post a job",
    description: "Hiring for your team?",
    href: "/jobs/new",
    icon: IconBriefcase,
    tone: "blue",
  },
  {
    id: "start-project",
    label: "Start a project",
    description: "Launch something new",
    href: "/projects/new",
    icon: IconLayoutKanban,
    tone: "green",
  },
];

export const dashboardStats: readonly DashboardStat[] = [
  { id: "members", label: "Members", value: 47, icon: IconUsers, tone: "blue" },
  { id: "projects", label: "Projects", value: 6, icon: IconRocket, tone: "green" },
  { id: "jobs", label: "Jobs", value: 25, icon: IconBriefcase, tone: "amber" },
  { id: "missions", label: "Missions", value: 5, icon: IconTrophy, tone: "violet" },
];

export const dashboardMembers: readonly DashboardMember[] = [
  {
    id: "nina-berg",
    name: "Nina Berg",
    role: "Member",
    href: "/members/nina-berg",
    avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=nina-berg",
  },
  {
    id: "omar-diallo",
    name: "Omar Diallo",
    role: "Member",
    href: "/members/omar-diallo",
    avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=omar-diallo",
  },
  {
    id: "june-park",
    name: "June Park",
    role: "Member",
    href: "/members/june-park",
    avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=june-park",
  },
  {
    id: "luca-rossi",
    name: "Luca Rossi",
    role: "Member",
    href: "/members/luca-rossi",
    avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=luca-rossi",
  },
  {
    id: "sofia-mendes",
    name: "Sofia Mendes",
    role: "Member",
    href: "/members/sofia-mendes",
    avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=sofia-mendes",
  },
  {
    id: "tomas-novak",
    name: "Tomas Novak",
    role: "Member",
    href: "/members/tomas-novak",
    avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=tomas-novak",
  },
];

export const dashboardActivity: readonly DashboardActivityEntry[] = [
  {
    id: "intro-to-cybersec",
    kind: "training",
    label: "Training",
    title: "Intro to Cybersec",
    href: "/academy/intro-to-cybersec",
    timestamp: "6 days ago",
  },
  {
    id: "design-system-audit",
    kind: "marketplace",
    label: "Marketplace",
    title: "Design system audit for a fintech app",
    href: "/marketplace/design-system-audit",
    timestamp: "1 week ago",
  },
  {
    id: "senior-platform-engineer",
    kind: "job",
    label: "Job",
    title: "Senior platform engineer, remote",
    href: "/jobs/senior-platform-engineer",
    timestamp: "1 week ago",
  },
  {
    id: "nina-berg-joined",
    kind: "member",
    label: "Member",
    title: "Nina Berg joined the cooperative",
    href: "/members/nina-berg",
    timestamp: "2 weeks ago",
  },
  {
    id: "accessibility-review",
    kind: "marketplace",
    label: "Marketplace",
    title: "Accessibility review for a public service portal",
    href: "/marketplace/accessibility-review",
    timestamp: "2 weeks ago",
  },
  {
    id: "data-engineer-contract",
    kind: "job",
    label: "Job",
    title: "Data engineer, 6 month contract",
    href: "/jobs/data-engineer-contract",
    timestamp: "3 weeks ago",
  },
];

export const dashboardCommunityChannels: readonly DashboardCommunityChannel[] = [
  {
    id: "discord",
    name: "Discord",
    description: "Chat with members in real time",
    href: "https://discord.com",
    icon: IconBrandDiscord,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Join the members channel",
    href: "https://whatsapp.com",
    icon: IconBrandWhatsapp,
  },
];
