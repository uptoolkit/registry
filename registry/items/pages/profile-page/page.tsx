import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  getActivityKindLabel,
  sampleActivity,
  sampleProfile,
  sampleProjects,
  type Profile,
  type ProfileActivity,
  type ProfileProject,
} from "./profile-data";

/**
 * User profile page.
 *
 * A header with the identity and stats, tabbed content for activity and
 * projects, and a details sidebar. Everything reads from one `Profile` record,
 * so swapping `sampleProfile` for a real lookup is the only change needed.
 */
export default function Page() {
  const profile = sampleProfile;

  return (
    <main className="min-h-svh bg-muted/40">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        <ProfileHeaderCard profile={profile} />

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1">
            <Tabs defaultValue="activity" className="gap-4">
              <TabsList variant="line" className="w-full justify-start">
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>

              <TabsContent value="activity">
                <ActivityTimeline activity={sampleActivity} />
              </TabsContent>

              <TabsContent value="projects">
                <ProjectList projects={sampleProjects} />
              </TabsContent>

              <TabsContent value="about">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">About {profile.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <p className="m-0 text-sm leading-relaxed text-muted-foreground">
                      {profile.bio}
                    </p>
                    <Separator />
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
            <DetailsCard profile={profile} />
          </aside>
        </div>
      </div>
    </main>
  );
}

function ProfileHeaderCard({ profile }: { profile: Profile }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="h-28 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
      <CardContent className="flex flex-col gap-4 px-4 pt-0 pb-4 sm:px-6 sm:pb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <Avatar className="-mt-10 size-20 border-4 border-background">
              <AvatarImage src={profile.avatarUrl} alt="" />
              <AvatarFallback>{profile.initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5 pb-1">
              <h1 className="m-0 text-xl font-semibold tracking-tight">{profile.name}</h1>
              <p className="m-0 text-sm text-muted-foreground">
                @{profile.handle} &middot; {profile.pronouns}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pb-1">
            <Button variant="outline" size="sm">
              Message
            </Button>
            <Button size="sm">Follow</Button>
          </div>
        </div>

        <p className="m-0 max-w-2xl text-sm text-muted-foreground">{profile.headline}</p>

        <dl className="m-0 flex flex-wrap gap-6">
          {profile.stats.map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-1.5">
              <dt className="order-2 text-sm text-muted-foreground">{stat.label}</dt>
              <dd className="order-1 m-0 text-sm font-semibold">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function ActivityTimeline({ activity }: { activity: readonly ProfileActivity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent activity</CardTitle>
        <CardDescription>The last few things that happened.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="m-0 flex list-none flex-col gap-0 p-0">
          {activity.map((entry, index) => (
            <li key={entry.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                {index < activity.length - 1 ? (
                  <span className="w-px flex-1 bg-border" aria-hidden />
                ) : null}
              </div>
              <div className="flex flex-col gap-1 pb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{getActivityKindLabel(entry.kind)}</Badge>
                  <span className="text-sm font-medium">{entry.title}</span>
                  <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                </div>
                <p className="m-0 text-sm text-muted-foreground">{entry.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function ProjectList({ projects }: { projects: readonly ProfileProject[] }) {
  return (
    <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
      {projects.map((project) => (
        <li key={project.id}>
          <Card className="h-full gap-2">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{project.name}</CardTitle>
                <Badge variant={project.status === "Active" ? "secondary" : "outline"}>
                  {project.status}
                </Badge>
              </div>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="m-0 text-sm text-muted-foreground">{project.role}</p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function DetailsCard({ profile }: { profile: Profile }) {
  const details = [
    { label: "Location", value: profile.location },
    { label: "Website", value: profile.website },
    { label: "Joined", value: profile.joinedAt },
  ];

  return (
    <Card className="gap-3 py-4">
      <CardHeader>
        <CardTitle className="text-base">Details</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="m-0 flex flex-col gap-3">
          {details.map((detail) => (
            <div key={detail.label} className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">{detail.label}</dt>
              <dd className="m-0 text-sm">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
