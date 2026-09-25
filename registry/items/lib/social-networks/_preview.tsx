"use client";

import {
  buildSocialNetworkUrl,
  detectSocialNetwork,
  sampleSocialProfiles,
} from "./social-networks";

const rows = [
  ["Detect LinkedIn", detectSocialNetwork(sampleSocialProfiles[1].url)],
  ["Facebook URL", buildSocialNetworkUrl("facebook", "mira.halvorsen")],
  ["Grok URL", buildSocialNetworkUrl("grok", "@mira_maps")],
];

export function Preview() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-3 text-left">
      <dl className="m-0 grid gap-1 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-wrap gap-x-2 border-b py-1">
            <dt className="w-32 shrink-0 text-muted-foreground">{label}</dt>
            <dd className="m-0 min-w-0 font-mono text-xs break-all">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
