"use client";

import {
  SAMPLE_NOW,
  samplePost,
  sampleReplies,
  sampleViewer,
} from "../../lib/social-sample-data/social-sample-data";
import { CommentThread } from "./comment-thread";

export function Preview() {
  return (
    <div className="w-full max-w-xl rounded-lg border p-4">
      <CommentThread
        object={samplePost}
        replies={sampleReplies}
        viewer={sampleViewer}
        now={SAMPLE_NOW}
        includeJsonLd
      />
    </div>
  );
}
