"use client";

import * as React from "react";

import { getActorHandle } from "../../lib/activitypub/activitypub";
import {
  sampleAuthor,
  sampleFollowers,
  sampleViewer,
} from "../../lib/social-sample-data/social-sample-data";
import { FollowButton, type FollowState } from "./follow-button";

const targets = [sampleAuthor, sampleFollowers[2]];

export function Preview() {
  const [log, setLog] = React.useState<string[]>([]);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {targets.map((actor) => (
        <div
          key={actor.id}
          className="flex items-center justify-between gap-3 rounded-md border p-3"
        >
          <span className="flex flex-col text-sm">
            <span className="font-medium">{actor.name}</span>
            <span className="text-xs text-muted-foreground">{getActorHandle(actor)}</span>
          </span>
          <FollowButton
            actor={actor}
            viewer={sampleViewer}
            onFollow={(activity) => setLog((l) => [`${activity.type} -> ${activity.object}`, ...l])}
            onUnfollow={(activity) =>
              setLog((l) => [`${activity.type} ${activity.object.type}`, ...l])
            }
            onStateChange={(state: FollowState) => setLog((l) => [`state: ${state}`, ...l])}
          />
        </div>
      ))}
      <p className="m-0 text-xs text-muted-foreground">
        {log[0] ?? "Follow an actor to emit an activity."}
      </p>
    </div>
  );
}
