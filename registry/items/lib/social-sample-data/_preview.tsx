"use client";

import { getActorHandle } from "../activitypub/activitypub";
import { sampleFollowers, sampleInbox, sampleTimeline, sampleViewer } from "./social-sample-data";

const summary = [
  ["Viewer", getActorHandle(sampleViewer)],
  ["Actors", String(sampleFollowers.length)],
  ["Timeline objects", String(sampleTimeline.length)],
  ["Inbox activities", String(sampleInbox.orderedItems?.length ?? 0)],
];

export function Preview() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-3 text-left">
      <dl className="m-0 grid gap-1 text-sm sm:grid-cols-2">
        {summary.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-2 rounded-md border p-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="m-0 font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <pre className="m-0 max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
        {JSON.stringify(sampleTimeline[0], null, 2)}
      </pre>
    </div>
  );
}
