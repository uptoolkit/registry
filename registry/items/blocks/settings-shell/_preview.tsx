"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { SettingsShell } from "./settings-shell";

export function Preview() {
  return (
    <SettingsShell
      description="Manage how you appear, what we send you, and how to leave."
      sections={[
        {
          id: "profile",
          label: "Profile",
          description: "Your name, handle, and how you show up to other people.",
          content: (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Public profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="m-0 text-sm text-muted-foreground">
                  Each section owns its own `content`.
                </p>
              </CardContent>
            </Card>
          ),
        },
        {
          id: "notifications",
          label: "Notifications",
          description: "Choose what we email you about.",
          content: (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Email preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="m-0 text-sm text-muted-foreground">
                  Switching sections swaps this pane.
                </p>
              </CardContent>
            </Card>
          ),
        },
      ]}
    />
  );
}
