export type SettingsSectionId = "profile" | "notifications" | "danger";

export type SettingsSection = {
  id: SettingsSectionId;
  label: string;
  description: string;
};

export type NotificationPreference = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

export type SettingsProfile = {
  name: string;
  handle: string;
  email: string;
  bio: string;
  avatarUrl: string;
  initials: string;
  plan: string;
};

export const settingsSections: readonly SettingsSection[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Your name, handle, and how you show up to other people.",
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Choose what we email you about.",
  },
  {
    id: "danger",
    label: "Danger zone",
    description: "Irreversible account actions.",
  },
];

export const sampleSettingsProfile: SettingsProfile = {
  name: "Rowan Ellis",
  handle: "rowan",
  email: "rowan@example.com",
  bio: "Design engineer working on tools for other builders.",
  avatarUrl: "https://github.com/shadcn.png",
  initials: "RE",
  plan: "Pro",
};

export const defaultNotificationPreferences: readonly NotificationPreference[] = [
  {
    id: "product-updates",
    label: "Product updates",
    description: "New features and meaningful changes. Roughly monthly.",
    enabled: true,
  },
  {
    id: "security-alerts",
    label: "Security alerts",
    description: "New sign-ins and credential changes. Always worth reading.",
    enabled: true,
  },
  {
    id: "weekly-digest",
    label: "Weekly digest",
    description: "A summary of activity across your workspaces.",
    enabled: false,
  },
  {
    id: "marketing",
    label: "Offers and research",
    description: "Occasional surveys and pricing experiments.",
    enabled: false,
  },
];
