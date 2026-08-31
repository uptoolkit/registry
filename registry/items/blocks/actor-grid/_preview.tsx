"use client";

import { sampleSuggestions } from "../../lib/social-sample-data/social-sample-data";
import { ActorGrid } from "./actor-grid";

export function Preview() {
  return (
    <div className="flex w-full flex-col gap-8">
      <ActorGrid
        heading="Followers"
        description="Everyone following this actor across the fediverse."
        columns={2}
        searchable
      />
      <ActorGrid
        actors={sampleSuggestions}
        heading="People you may know"
        variant="row"
        columns={1}
        includeJsonLd={false}
      />
    </div>
  );
}
