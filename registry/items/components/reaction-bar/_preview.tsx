"use client";

import * as React from "react";

import { samplePost, sampleViewer } from "../../lib/social-sample-data/social-sample-data";
import { ReactionBar } from "./reaction-bar";

export function Preview() {
  const [last, setLast] = React.useState("Hover the like button to pick a reaction.");

  return (
    <div className="flex w-full max-w-lg flex-col gap-3 rounded-lg border p-3">
      <ReactionBar
        object={samplePost}
        viewer={sampleViewer}
        showBookmark
        onLike={(activity) => setLast(`${activity.type} ${activity.content ?? ""}`.trim())}
        onUnlike={(activity) => setLast(`${activity.type} ${activity.object.type}`)}
        onShare={(activity) => setLast(activity.type)}
        onUnshare={(activity) => setLast(`${activity.type} ${activity.object.type}`)}
        onReply={() => setLast("Reply requested")}
      />
      <p className="m-0 text-xs text-muted-foreground">{last}</p>
    </div>
  );
}
