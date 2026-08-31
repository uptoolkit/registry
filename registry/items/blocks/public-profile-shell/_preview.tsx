"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { sampleAuthor, sampleCounts } from "../../lib/social-sample-data/social-sample-data";
import { PublicProfileShell } from "./public-profile-shell";

export function Preview() {
  return (
    <PublicProfileShell
      actor={sampleAuthor}
      counts={sampleCounts.author}
      aside={
        <Card className="gap-3 py-4">
          <CardHeader>
            <CardTitle className="text-base">Mutual contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="m-0 text-sm text-muted-foreground">Rail content goes in `aside`.</p>
          </CardContent>
        </Card>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="m-0 text-sm text-muted-foreground">
            The timeline or wall feed renders in the shell&apos;s content slot.
          </p>
        </CardContent>
      </Card>
    </PublicProfileShell>
  );
}
