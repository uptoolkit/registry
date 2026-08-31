import {
  IconBookmark,
  IconCalendarEvent,
  IconHome,
  IconUsersGroup,
  IconWorld,
} from "@tabler/icons-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { ActorGrid } from "../../blocks/actor-grid/actor-grid";
import { NotificationsPanel } from "../../blocks/notifications-panel/notifications-panel";
import { SocialFeed } from "../../blocks/social-feed/social-feed";
import { ActorAvatar } from "../../components/actor-avatar/actor-avatar";
import { JsonLd } from "../../components/json-ld/json-ld";
import { getActorHandle } from "../../lib/activitypub/activitypub";
import { toPersonJsonLd } from "../../lib/schema-org/schema-org";
import {
  SAMPLE_NOW,
  sampleCounts,
  sampleFeed,
  sampleFollowers,
  sampleInbox,
  sampleSuggestions,
  sampleViewer,
} from "../../lib/social-sample-data/social-sample-data";

const shortcuts = [
  { label: "Home", icon: IconHome, href: "/feed" },
  { label: "Friends", icon: IconUsersGroup, href: "/friends" },
  { label: "Explore", icon: IconWorld, href: "/explore" },
  { label: "Saved", icon: IconBookmark, href: "/saved" },
  { label: "Events", icon: IconCalendarEvent, href: "/events" },
];

/**
 * Social home page.
 *
 * Three columns: navigation, the timeline, and a rail of suggestions and
 * notifications. The feed, grid, and panel are client components; this page
 * stays a server component and only passes data down, so swap the sample
 * fixtures for your own `inbox` fetch here.
 */
export default function Page() {
  const viewerJsonLd = toPersonJsonLd(sampleViewer, { counts: sampleCounts.viewer });

  return (
    <div className="min-h-svh bg-muted/40">
      <JsonLd data={viewerJsonLd} />

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside
          aria-label="Shortcuts"
          className="sticky top-6 hidden h-fit w-60 shrink-0 flex-col gap-4 lg:flex"
        >
          <a
            href={sampleViewer.url ?? sampleViewer.id}
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent"
          >
            <ActorAvatar actor={sampleViewer} size="lg" presence="online" />
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-semibold">{sampleViewer.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {getActorHandle(sampleViewer)}
              </span>
            </span>
          </a>

          <Separator />

          <nav aria-label="Primary">
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {shortcuts.map((shortcut) => (
                <li key={shortcut.label}>
                  <a
                    href={shortcut.href}
                    className="flex items-center gap-3 rounded-lg p-2 text-sm font-medium hover:bg-accent"
                  >
                    <shortcut.icon aria-hidden="true" className="size-5 text-muted-foreground" />
                    {shortcut.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <Separator />

          <ActorGrid
            actors={sampleFollowers.slice(0, 4)}
            heading="Contacts"
            variant="row"
            columns={1}
            includeJsonLd={false}
          />
        </aside>

        <main className="flex min-w-0 flex-1 justify-center">
          <SocialFeed
            viewer={sampleViewer}
            collection={sampleFeed}
            heading="Home timeline"
            showComments
            now={SAMPLE_NOW}
          />
        </main>

        <aside className="sticky top-6 hidden h-fit w-80 shrink-0 flex-col gap-4 xl:flex">
          <NotificationsPanel
            collection={sampleInbox}
            viewer={sampleViewer}
            maxHeight={320}
            now={SAMPLE_NOW}
            className="max-w-none"
          />

          <Card className="gap-3 py-4">
            <CardHeader>
              <CardTitle className="text-base">People you may know</CardTitle>
            </CardHeader>
            <CardContent>
              <ActorGrid
                actors={sampleSuggestions}
                heading="Suggestions"
                variant="row"
                columns={1}
                includeJsonLd={false}
                className="gap-2 [&>div:first-child]:hidden"
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
