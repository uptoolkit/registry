"use client";

import {
  toFeedEntries,
  sampleActivityCollection,
} from "../../lib/activity-entries/activity-entries";
import { getCollectionItems } from "../../lib/activitypub/activitypub";
import { SAMPLE_NOW, sampleViewer } from "../../lib/social-sample-data/social-sample-data";
import { ActivityFeedItem } from "./activity-feed-item";

const entries = toFeedEntries(getCollectionItems(sampleActivityCollection));

export function Preview() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <ActivityFeedItem entry={entries[0]} viewer={sampleViewer} now={SAMPLE_NOW} />
      <ActivityFeedItem entry={entries[1]} viewer={sampleViewer} now={SAMPLE_NOW} />
    </div>
  );
}
