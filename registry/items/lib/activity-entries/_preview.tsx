"use client";

import { getCollectionItems } from "../activitypub/activitypub";
import { getFeedEntryKind, sampleActivityCollection, toFeedEntries } from "./activity-entries";

const entries = toFeedEntries(getCollectionItems(sampleActivityCollection));

const rows = entries.map((entry) => [
  entry.activity.type,
  getFeedEntryKind(entry.activity) ?? "-",
  entry.actor.preferredUsername,
]);

export function Preview() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-3 text-left">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-1 pr-4 font-medium">Activity</th>
            <th className="py-1 pr-4 font-medium">Kind</th>
            <th className="py-1 font-medium">Actor</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([activity, kind, actor]) => (
            <tr key={`${activity}-${actor}`} className="border-b">
              <td className="py-1 pr-4 font-mono text-xs">{activity}</td>
              <td className="py-1 pr-4">{kind}</td>
              <td className="py-1">@{actor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
