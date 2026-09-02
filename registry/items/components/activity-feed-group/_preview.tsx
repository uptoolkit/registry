"use client";

import {
  toFeedEntries,
  sampleActivityCollection,
} from "../../lib/activity-entries/activity-entries";
import { getCollectionItems } from "../../lib/activitypub/activitypub";
import { sampleViewer } from "../../lib/social-sample-data/social-sample-data";
import { ActivityFeedItem } from "../activity-feed-item/activity-feed-item";
import { ActivityFeedGroup } from "./activity-feed-group";

const entries = toFeedEntries(getCollectionItems(sampleActivityCollection)).slice(0, 2);

export function Preview() {
  return (
    <ActivityFeedGroup label="Today">
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {entries.map((entry) => (
          <li key={entry.activity.id}>
            <ActivityFeedItem entry={entry} viewer={sampleViewer} />
          </li>
        ))}
      </ol>
    </ActivityFeedGroup>
  );
}
