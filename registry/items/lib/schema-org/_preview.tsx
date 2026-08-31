"use client";

import { sampleCounts, samplePost, sampleViewer } from "../social-sample-data/social-sample-data";
import { toPersonJsonLd, toSocialMediaPostingJsonLd } from "./schema-org";

const nodes = [
  toPersonJsonLd(sampleViewer, { counts: sampleCounts.viewer }),
  toSocialMediaPostingJsonLd(samplePost),
];

export function Preview() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-3 text-left">
      {nodes.map((node) => (
        <pre
          key={String(node["@id"])}
          className="m-0 max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs"
        >
          {JSON.stringify(node, null, 2)}
        </pre>
      ))}
    </div>
  );
}
