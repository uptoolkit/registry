"use client";

import {
  SAMPLE_NOW,
  sampleAnnounce,
  samplePost,
  sampleViewer,
  sensitivePost,
} from "../../lib/social-sample-data/social-sample-data";
import { PostCard } from "./post-card";

export function Preview() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <PostCard object={samplePost} viewer={sampleViewer} now={SAMPLE_NOW} includeJsonLd />
      <PostCard
        object={sampleAnnounce.object}
        activity={sampleAnnounce}
        viewer={sampleViewer}
        now={SAMPLE_NOW}
      />
      <PostCard object={sensitivePost} viewer={sampleViewer} now={SAMPLE_NOW} />
    </div>
  );
}
