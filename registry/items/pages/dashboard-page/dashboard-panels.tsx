"use client";

import {
  IconActivity,
  IconBriefcase,
  IconBuildingStore,
  IconChevronLeft,
  IconChevronRight,
  IconSchool,
  IconUsers,
  type Icon,
} from "@tabler/icons-react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { DashboardShell } from "../../layouts/dashboard-shell/dashboard-shell";
import {
  dashboardLocales,
  dashboardNav,
  dashboardUser,
  dashboardWorkspaces,
  type DashboardActivityEntry,
  type DashboardActivityKind,
  type DashboardMember,
} from "./dashboard-data";

/**
 * Client boundary around the shell.
 *
 * The shell takes callbacks for search, create, messages, and the language
 * switcher, so it has to be mounted from a client component. Keeping that in
 * one small wrapper lets the page itself stay a server component and pass its
 * sections in as `children`. Replace the handlers with your router, command
 * palette, and locale writer.
 */
function DashboardChrome({ children }: { children: React.ReactNode }) {
  const [workspaceId, setWorkspaceId] = React.useState(dashboardWorkspaces[0]?.id);
  const [locale, setLocale] = React.useState(dashboardLocales[0]?.value);
  const workspace =
    dashboardWorkspaces.find((entry) => entry.id === workspaceId) ?? dashboardWorkspaces[0];

  return (
    <DashboardShell
      workspace={workspace}
      workspaces={dashboardWorkspaces}
      onWorkspaceChange={setWorkspaceId}
      user={dashboardUser}
      nav={dashboardNav}
      locale={locale}
      locales={dashboardLocales}
      onLocaleChange={setLocale}
      messagesCount={1}
      notificationsCount={4}
      onSearch={() => {}}
      onCreateClick={() => {}}
      onMessagesClick={() => {}}
      onNotificationsClick={() => {}}
      onSupportClick={() => {}}
    >
      {children}
    </DashboardShell>
  );
}

type NewMembersCarouselProps = {
  members: readonly DashboardMember[];
  /** Cards per page. The dots below the track page through the list. */
  pageSize?: number;
};

/**
 * Paged grid of recently joined members.
 *
 * Pages rather than scrolls, so every card stays fully visible and the dots
 * map one-to-one to what a click will show.
 */
function NewMembersCarousel({ members, pageSize = 3 }: NewMembersCarouselProps) {
  const [page, setPage] = React.useState(0);
  const pageCount = Math.max(1, Math.ceil(members.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = members.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconUsers aria-hidden="true" className="size-4 text-muted-foreground" />
          New members
        </CardTitle>
        {pageCount > 1 ? (
          <CardAction className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Previous members"
              disabled={currentPage === 0}
              onClick={() => setPage(currentPage - 1)}
            >
              <IconChevronLeft aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Next members"
              disabled={currentPage === pageCount - 1}
              onClick={() => setPage(currentPage + 1)}
            >
              <IconChevronRight aria-hidden="true" />
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((member) => (
            <li key={member.id} className="flex flex-col items-center gap-3 rounded-xl border p-5">
              <Avatar size="lg" className="size-14">
                <AvatarImage src={member.avatarUrl} alt="" />
                <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="flex flex-col items-center gap-0.5 text-center">
                <span className="font-medium">{member.name}</span>
                <span className="text-sm text-muted-foreground">{member.role}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<a href={member.href} />}
                className="w-full"
              >
                View profile
              </Button>
            </li>
          ))}
        </ul>

        {pageCount > 1 ? (
          <div className="flex items-center justify-center gap-1.5">
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show members ${index + 1} of ${pageCount}`}
                aria-current={index === currentPage ? "true" : undefined}
                onClick={() => setPage(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === currentPage
                    ? "w-5 bg-foreground"
                    : "w-1.5 bg-border hover:bg-border/80",
                )}
              />
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

const activityKindIcons = {
  training: IconSchool,
  marketplace: IconBuildingStore,
  job: IconBriefcase,
  member: IconUsers,
} as const satisfies Record<DashboardActivityKind, Icon>;

type ActivityTab = {
  id: string;
  label: string;
  icon: Icon;
  /** Kinds this tab keeps. `null` keeps everything. */
  kinds: readonly DashboardActivityKind[] | null;
};

const activityTabs: readonly ActivityTab[] = [
  { id: "all", label: "All", icon: IconActivity, kinds: null },
  { id: "marketplace", label: "Marketplace", icon: IconBuildingStore, kinds: ["marketplace"] },
  { id: "jobs", label: "Jobs", icon: IconBriefcase, kinds: ["job"] },
  { id: "members", label: "Members", icon: IconUsers, kinds: ["member"] },
];

/**
 * Activity feed with category tabs.
 *
 * Filtering happens client-side over the entries the page already loaded, so
 * switching tabs costs nothing. Move it to a search param and a per-tab query
 * once the feed is longer than a page.
 */
function ActivityFeed({ entries }: { entries: readonly DashboardActivityEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <IconActivity aria-hidden="true" className="size-4 text-muted-foreground" />
          Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="gap-4">
          <TabsList variant="line" className="flex-wrap">
            {activityTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                <tab.icon data-icon="inline-start" aria-hidden="true" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {activityTabs.map((tab) => {
            const kinds = tab.kinds;
            const visible = kinds ? entries.filter((entry) => kinds.includes(entry.kind)) : entries;

            return (
              <TabsContent key={tab.id} value={tab.id}>
                {visible.length > 0 ? (
                  <ul className="m-0 flex list-none flex-col p-0">
                    {visible.map((entry) => {
                      const EntryIcon = activityKindIcons[entry.kind];

                      return (
                        <li key={entry.id} className="border-b last:border-b-0">
                          <a
                            href={entry.href}
                            className="flex items-center gap-3 rounded-lg px-1 py-3 transition-colors hover:bg-muted/50"
                          >
                            <span
                              aria-hidden="true"
                              className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"
                            >
                              <EntryIcon className="size-4" />
                            </span>
                            <Badge variant="secondary" className="shrink-0">
                              {entry.label}
                            </Badge>
                            <span className="min-w-0 flex-1 truncate text-sm font-medium">
                              {entry.title}
                            </span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {entry.timestamp}
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="m-0 py-6 text-center text-sm text-muted-foreground">
                    Nothing here yet.
                  </p>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}

export { ActivityFeed, DashboardChrome, NewMembersCarousel };
