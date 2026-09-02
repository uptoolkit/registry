"use client";

import {
  IconBriefcase,
  IconBuildingStore,
  IconClock,
  IconFolders,
  IconLayoutGrid,
  IconTarget,
  IconUsers,
} from "@tabler/icons-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { DashboardShell } from "./dashboard-shell";

export function Preview() {
  return (
    <DashboardShell
      className="w-full"
      workspace={{ id: "my-space", name: "My Space", meta: "Personal" }}
      workspaces={[
        { id: "my-space", name: "My Space", meta: "Personal" },
        { id: "co-labs", name: "Co-Labs", meta: "Cooperative" },
      ]}
      nav={[
        {
          label: "Explore",
          items: [
            { label: "Dashboard", href: "#dashboard", icon: IconLayoutGrid, active: true },
            { label: "Marketplace", href: "#marketplace", icon: IconBuildingStore },
            { label: "Jobs", href: "#jobs", icon: IconBriefcase },
            { label: "Missions", href: "#missions", icon: IconTarget },
            { label: "Members", href: "#members", icon: IconUsers },
            { label: "Projects", href: "#projects", icon: IconFolders },
          ],
        },
        {
          label: "My space",
          items: [
            { label: "Timesheet", href: "#timesheet", icon: IconClock },
            { label: "My projects", href: "#my-projects", icon: IconFolders },
          ],
        },
      ]}
      messagesCount={1}
      notificationsCount={4}
      locale="en"
      locales={[
        { value: "en", label: "English" },
        { value: "fr", label: "Français" },
      ]}
      onSearch={() => {}}
      onCreateClick={() => {}}
      onMessagesClick={() => {}}
      onNotificationsClick={() => {}}
      onLocaleChange={() => {}}
      onSupportClick={() => {}}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="m-0 text-sm text-muted-foreground">
            Page content renders in the shell&apos;s content slot.
          </p>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
