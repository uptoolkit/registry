"use client";

import * as React from "react";

import { getVisibility } from "../../lib/activitypub/activitypub";
import { sampleViewer } from "../../lib/social-sample-data/social-sample-data";
import { PostComposer } from "./post-composer";

export function Preview() {
  const [activity, setActivity] = React.useState<string | null>(null);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <PostComposer
        author={sampleViewer}
        onSubmit={(created) =>
          setActivity(
            `${created.type} -> ${getVisibility(created.object).visibility}, ${created.object.tag?.length ?? 0} tag(s)`,
          )
        }
      />
      <p className="m-0 text-xs text-muted-foreground">
        {activity ?? "Try @someone@example.social and #hashtags, then post."}
      </p>
    </div>
  );
}
