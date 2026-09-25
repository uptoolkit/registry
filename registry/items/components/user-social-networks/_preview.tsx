"use client";

import { UserSocialNetworks } from "./user-social-networks";

export function Preview() {
  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <UserSocialNetworks variant="facebook" />
      <UserSocialNetworks variant="linkedin" />
      <UserSocialNetworks variant="grok" />
    </div>
  );
}
