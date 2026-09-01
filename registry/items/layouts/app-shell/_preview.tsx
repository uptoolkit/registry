"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { sampleViewer } from "../../lib/social-sample-data/social-sample-data";
import { AppShell } from "./app-shell";

export function Preview() {
  return (
    <AppShell
      viewer={sampleViewer}
      notificationsCount={3}
      onSearch={() => {}}
      nav={[
        { label: "Home", href: "#home", active: true },
        { label: "Explore", href: "#explore" },
        { label: "Notifications", href: "#notifications" },
      ]}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="m-0 text-sm text-muted-foreground">
            Page content renders in the shell&apos;s content slot.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
