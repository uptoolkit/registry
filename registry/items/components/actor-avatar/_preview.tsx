"use client";

import {
  sampleAuthor,
  sampleFollowers,
  sampleViewer,
} from "../../lib/social-sample-data/social-sample-data";
import { ActorAvatar, ActorAvatarGroup } from "./actor-avatar";

export function Preview() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-end gap-4">
        <ActorAvatar actor={sampleViewer} size="sm" />
        <ActorAvatar actor={sampleViewer} presence="online" />
        <ActorAvatar actor={sampleAuthor} size="lg" verified />
        <ActorAvatar actor={sampleFollowers[2]} size="lg" showLock />
      </div>
      <ActorAvatarGroup actors={sampleFollowers} total={18940} max={4} />
    </div>
  );
}
