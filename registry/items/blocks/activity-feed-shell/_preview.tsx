"use client";

import { ActivityFeed } from "../activity-feed/activity-feed";
import { ActivityFeedShell } from "./activity-feed-shell";

export function Preview() {
  return (
    <ActivityFeedShell>
      <ActivityFeed hideFilters variant="timeline" />
    </ActivityFeedShell>
  );
}
