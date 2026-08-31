"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import {
  defaultNotificationPreferences,
  settingsSections,
  type NotificationPreference,
  type SettingsProfile,
  type SettingsSectionId,
} from "./settings-data";

type SettingsPanelsProps = {
  profile: SettingsProfile;
  notifications?: readonly NotificationPreference[];
};

/**
 * Client half of the settings page: the section nav, the forms, and their local
 * state. Swap the `onSubmit` handlers for server actions and the layout is
 * unchanged.
 */
function SettingsPanels({
  profile,
  notifications = defaultNotificationPreferences,
}: SettingsPanelsProps) {
  const [activeSection, setActiveSection] = React.useState<SettingsSectionId>("profile");
  const section = settingsSections.find((entry) => entry.id === activeSection);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <nav aria-label="Settings sections" className="w-full shrink-0 lg:w-56">
        <ul className="m-0 flex list-none gap-1 p-0 lg:flex-col">
          {settingsSections.map((entry) => (
            <li key={entry.id} className="flex-1 lg:flex-none">
              <Button
                variant={entry.id === activeSection ? "secondary" : "ghost"}
                size="sm"
                aria-current={entry.id === activeSection ? "page" : undefined}
                className="w-full justify-start"
                onClick={() => setActiveSection(entry.id)}
              >
                {entry.label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {section ? (
          <div className="flex flex-col gap-1">
            <h2 className="m-0 text-lg font-semibold tracking-tight">{section.label}</h2>
            <p className="m-0 text-sm text-muted-foreground">{section.description}</p>
          </div>
        ) : null}

        {activeSection === "profile" ? <ProfilePanel profile={profile} /> : null}
        {activeSection === "notifications" ? (
          <NotificationsPanel preferences={notifications} />
        ) : null}
        {activeSection === "danger" ? <DangerPanel handle={profile.handle} /> : null}
      </div>
    </div>
  );
}

function ProfilePanel({ profile }: { profile: SettingsProfile }) {
  const [saved, setSaved] = React.useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Public profile</CardTitle>
          <CardDescription>This is what other people see.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarImage src={profile.avatarUrl} alt="" />
              <AvatarFallback>{profile.initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{profile.name}</span>
                <Badge variant="secondary">{profile.plan}</Badge>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="xs">
                  Upload
                </Button>
                <Button type="button" variant="ghost" size="xs">
                  Remove
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="settings-name">Name</Label>
              <Input id="settings-name" name="name" defaultValue={profile.name} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="settings-handle">Handle</Label>
              <Input id="settings-handle" name="handle" defaultValue={profile.handle} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="settings-email">Email</Label>
            <Input
              id="settings-email"
              name="email"
              type="email"
              defaultValue={profile.email}
              aria-describedby="settings-email-hint"
            />
            <p id="settings-email-hint" className="m-0 text-xs text-muted-foreground">
              Changing this sends a confirmation link to the new address.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="settings-bio">Bio</Label>
            <Textarea
              id="settings-bio"
              name="bio"
              rows={3}
              defaultValue={profile.bio}
              className="resize-none"
            />
          </div>
        </CardContent>

        <CardFooter className="justify-between gap-3 border-t">
          <p className="m-0 text-sm text-muted-foreground" role="status">
            {saved ? "Saved." : " "}
          </p>
          <div className="flex gap-2">
            <Button type="reset" variant="ghost" size="sm" onClick={() => setSaved(false)}>
              Reset
            </Button>
            <Button type="submit" size="sm">
              Save changes
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}

function NotificationsPanel({ preferences }: { preferences: readonly NotificationPreference[] }) {
  const [enabled, setEnabled] = React.useState(
    () => new Set(preferences.filter((entry) => entry.enabled).map((entry) => entry.id)),
  );

  function toggle(id: string) {
    setEnabled((current) => {
      const next = new Set(current);

      if (!next.delete(id)) {
        next.add(id);
      }

      return next;
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Email preferences</CardTitle>
        <CardDescription>Security alerts cannot be fully disabled.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-0">
        {preferences.map((preference, index) => (
          <React.Fragment key={preference.id}>
            {index > 0 ? <Separator className="my-3" /> : null}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{preference.label}</span>
                <span className="text-sm text-muted-foreground">{preference.description}</span>
              </div>
              <Button
                variant={enabled.has(preference.id) ? "secondary" : "outline"}
                size="sm"
                role="switch"
                aria-checked={enabled.has(preference.id)}
                onClick={() => toggle(preference.id)}
              >
                {enabled.has(preference.id) ? "On" : "Off"}
              </Button>
            </div>
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
}

function DangerPanel({ handle }: { handle: string }) {
  const [confirmation, setConfirmation] = React.useState("");
  const canDelete = confirmation === handle;

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-base text-destructive">Delete account</CardTitle>
        <CardDescription>
          This removes your profile, projects, and history. It cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5">
        <Label htmlFor="settings-confirm">
          Type <span className="font-mono">{handle}</span> to confirm
        </Label>
        <Input
          id="settings-confirm"
          value={confirmation}
          autoComplete="off"
          placeholder={handle}
          onChange={(event) => setConfirmation(event.target.value)}
        />
      </CardContent>
      <CardFooter className="justify-end border-t">
        <Button variant="destructive" size="sm" disabled={!canDelete}>
          Delete this account
        </Button>
      </CardFooter>
    </Card>
  );
}

export { SettingsPanels, type SettingsPanelsProps };
