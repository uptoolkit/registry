"use client";

import {
  sampleAuthor,
  sampleCounts,
  sampleFollowers,
  sampleViewer,
} from "../../lib/social-sample-data/social-sample-data";
import { ActorCard } from "./actor-card";

export function Preview() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <ActorCard
        actor={sampleAuthor}
        viewer={sampleViewer}
        counts={sampleCounts.author}
        showFields
        includeJsonLd
        onMessage={() => undefined}
      />
      <ActorCard actor={sampleFollowers[2]} viewer={sampleViewer} variant="row" />
    </div>
  );
}
