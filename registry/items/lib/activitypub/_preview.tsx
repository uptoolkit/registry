"use client";

import { sampleViewer } from "../social-sample-data/social-sample-data";
import {
  buildAudience,
  buildWebFingerUrl,
  createNoteActivity,
  getActorHandle,
  getVisibility,
} from "./activitypub";

const activity = createNoteActivity({
  actor: sampleViewer,
  content: "Hello, fediverse.",
  visibility: "followers",
  published: "2025-06-12T14:00:00.000Z",
  id: "https://social.example/users/ada/activities/create/demo",
  objectId: "https://social.example/users/ada/posts/demo",
});

const rows = [
  ["Handle", getActorHandle(sampleViewer)],
  ["WebFinger", buildWebFingerUrl(getActorHandle(sampleViewer)) ?? "-"],
  ["Audience", JSON.stringify(buildAudience({ visibility: "public", actor: sampleViewer }))],
  ["Visibility", getVisibility(activity.object).visibility],
];

export function Preview() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-3 text-left">
      <dl className="m-0 grid gap-1 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-wrap gap-x-2 border-b py-1">
            <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
            <dd className="m-0 min-w-0 font-mono text-xs break-all">{value}</dd>
          </div>
        ))}
      </dl>
      <pre className="m-0 max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
        {JSON.stringify(activity, null, 2)}
      </pre>
    </div>
  );
}
