"use client";

import { sampleViewer } from "../../lib/social-sample-data/social-sample-data";
import { ProfileHeader } from "./profile-header";

export function Preview() {
  return <ProfileHeader viewer={sampleViewer} className="max-w-3xl" />;
}
