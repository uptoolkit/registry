"use client";

import { SocialNetworkLink } from "./social-network-link";
import { sampleSocialProfiles } from "../../lib/social-networks/social-networks";

export function Preview() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <SocialNetworkLink profile={sampleSocialProfiles[0]} variant="icon" />
      <SocialNetworkLink profile={sampleSocialProfiles[1]} variant="row" />
      <SocialNetworkLink profile={sampleSocialProfiles[2]} variant="chip" />
    </div>
  );
}
