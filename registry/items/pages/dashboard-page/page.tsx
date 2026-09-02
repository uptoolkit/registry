import { IconPlus, IconUsersGroup } from "@tabler/icons-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  dashboardActivity,
  dashboardCommunityChannels,
  dashboardMembers,
  dashboardQuickActions,
  dashboardStats,
  type DashboardTone,
} from "./dashboard-data";
import { ActivityFeed, DashboardChrome, NewMembersCarousel } from "./dashboard-panels";

/** Tile background and icon tint per tone, keyed by `DashboardTone`. */
const toneTileClasses = {
  orange:
    "bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-950/60",
  blue: "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-950/60",
  green:
    "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60",
  amber:
    "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/60",
  violet:
    "bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:hover:bg-violet-950/60",
} as const satisfies Record<DashboardTone, string>;

/** Chip behind a stat icon. Same tones, without the hover state. */
const toneChipClasses = {
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
  green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300",
} as const satisfies Record<DashboardTone, string>;

/**
 * Default dashboard page.
 *
 * The page stays a server component: it reads the fixtures and lays out the
 * sections, while `DashboardChrome`, `NewMembersCarousel`, and `ActivityFeed`
 * own the client state. Replace the imports from `dashboard-data` with your own
 * queries — nothing else here needs to change.
 */
export default function Page() {
  return (
    <DashboardChrome>
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <h1 className="sr-only">Dashboard</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconPlus aria-hidden="true" className="size-4 text-muted-foreground" />
              Quick actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-3">
              {dashboardQuickActions.map((action) => (
                <li key={action.id}>
                  <a
                    href={action.href}
                    className={cn(
                      "flex h-full flex-col items-center gap-1 rounded-xl px-4 py-6 text-center transition-colors",
                      toneTileClasses[action.tone],
                    )}
                  >
                    <action.icon aria-hidden="true" className="mb-1 size-5" />
                    <span className="font-medium">{action.label}</span>
                    <span className="text-sm opacity-80">{action.description}</span>
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((stat) => (
            <li key={stat.id}>
              <Card className="h-full">
                <CardContent className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-lg",
                      toneChipClasses[stat.tone],
                    )}
                  >
                    <stat.icon className="size-5" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="font-heading text-2xl leading-tight font-semibold tabular-nums">
                      {stat.value}
                    </span>
                    <span className="truncate text-sm text-muted-foreground">{stat.label}</span>
                  </span>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>

        <NewMembersCarousel members={dashboardMembers} />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <ActivityFeed entries={dashboardActivity} />

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUsersGroup aria-hidden="true" className="size-4 text-muted-foreground" />
                Join the community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {dashboardCommunityChannels.map((channel) => (
                  <li key={channel.id}>
                    <a
                      href={channel.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50"
                    >
                      <span
                        aria-hidden="true"
                        className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"
                      >
                        <channel.icon className="size-4" />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="font-medium">{channel.name}</span>
                        <span className="truncate text-sm text-muted-foreground">
                          {channel.description}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardChrome>
  );
}
