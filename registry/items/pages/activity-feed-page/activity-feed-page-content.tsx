"use client";

import {
  IconBookmark,
  IconCalendarEvent,
  IconHome,
  IconUsersGroup,
  IconWorld,
} from "@tabler/icons-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ActivityFeedShell } from "../../blocks/activity-feed-shell/activity-feed-shell";
import { ActivityFeed } from "../../blocks/activity-feed/activity-feed";
import { ActorGrid } from "../../blocks/actor-grid/actor-grid";
import { NotificationsPanel } from "../../blocks/notifications-panel/notifications-panel";
import { JsonLd } from "../../components/json-ld/json-ld";
import { sampleActivityCollection } from "../../lib/activity-entries/activity-entries";
import { toPersonJsonLd } from "../../lib/schema-org/schema-org";
import {
  SAMPLE_NOW,
  sampleCounts,
  sampleFollowers,
  sampleInbox,
  sampleSuggestions,
  sampleViewer,
} from "../../lib/social-sample-data/social-sample-data";

const shortcuts = [
  { label: "Home", icon: IconHome, href: "/activity", active: true },
  { label: "Friends", icon: IconUsersGroup, href: "/friends" },
  { label: "Explore", icon: IconWorld, href: "/explore" },
  { label: "Saved", icon: IconBookmark, href: "/saved" },
  { label: "Events", icon: IconCalendarEvent, href: "/events" },
];

/**
 * Client half of the activity feed page.
 *
 * Holds navigation icons and interactive blocks so the server `page.tsx` can
 * stay a thin wrapper around data fetching.
 */
export function ActivityFeedPageContent() {
  const viewerJsonLd = toPersonJsonLd(sampleViewer, { counts: sampleCounts.viewer });

  return (
    <ActivityFeedShell
      viewer={sampleViewer}
      brand={{ name: "Activity", href: "/activity" }}
      nav={shortcuts}
      notificationsCount={sampleInbox.totalItems ?? 0}
      sidebar={
        <ActorGrid
          actors={sampleFollowers.slice(0, 4)}
          heading="Contacts"
          variant="row"
          columns={1}
          includeJsonLd={false}
        />
      }
      rail={
        <>
          <JsonLd data={viewerJsonLd} />

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
        </>
      }
    >
      <ActivityFeed
        viewer={sampleViewer}
        collection={sampleActivityCollection}
        heading="Your activity"
        variant="full"
        showComments
        now={SAMPLE_NOW}
      />
    </ActivityFeedShell>
  );
}
