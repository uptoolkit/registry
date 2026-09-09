import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { JsonLd } from "../../components/json-ld/json-ld";
import {
  samplePerson,
  samplePersonExperience,
  samplePersonPublications,
  type PersonExperience,
  type PersonProfile,
  type PersonPublication,
} from "./person-data";

/**
 * Person detail page.
 *
 * A single `PersonProfile` record drives the header, bio, experience
 * timeline, and publications list, and is projected once more into a
 * Schema.org `Person` node so search engines get the same facts. Replace
 * `samplePerson` with a lookup and this stays a server component throughout.
 */
export default function Page() {
  const person = samplePerson;

  return (
    <main className="min-h-svh bg-muted/40">
      <JsonLd data={toPersonJsonLd(person)} />

      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
        <PersonHeaderCard person={person} />

        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="min-w-0 flex-1">
            <ExperienceList experience={samplePersonExperience} />
          </div>

          <aside className="flex w-full shrink-0 flex-col gap-4 sm:w-72">
            <DetailsCard person={person} />
            <PublicationsCard publications={samplePersonPublications} />
          </aside>
        </div>
      </div>
    </main>
  );
}

function PersonHeaderCard({ person }: { person: PersonProfile }) {
  return (
    <Card className="gap-4 py-6">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="size-16">
            <AvatarImage src={person.avatarUrl} alt="" />
            <AvatarFallback>{person.initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h1 className="m-0 text-xl font-semibold tracking-tight">{person.name}</h1>
            <p className="m-0 text-sm text-muted-foreground">
              {person.jobTitle} at {person.worksFor}
            </p>
            <p className="m-0 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {person.bio}
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {person.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Button size="sm" nativeButton={false} render={<a href={`mailto:${person.email}`} />}>
          Contact
        </Button>
      </CardContent>
    </Card>
  );
}

function ExperienceList({ experience }: { experience: readonly PersonExperience[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Experience</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="m-0 flex list-none flex-col gap-0 p-0">
          {experience.map((entry, index) => (
            <li key={entry.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                {index < experience.length - 1 ? (
                  <span className="w-px flex-1 bg-border" aria-hidden />
                ) : null}
              </div>
              <div className="flex flex-col gap-1 pb-6">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-medium">{entry.role}</span>
                  <span className="text-sm text-muted-foreground">
                    &middot; {entry.organization}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{entry.period}</span>
                <p className="m-0 text-sm text-muted-foreground">{entry.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function DetailsCard({ person }: { person: PersonProfile }) {
  const details = [
    { label: "Location", value: person.location },
    { label: "Email", value: person.email },
    { label: "Website", value: person.url },
  ];

  return (
    <Card className="gap-3 py-4">
      <CardHeader>
        <CardTitle className="text-base">Details</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <dl className="m-0 flex flex-col gap-3">
          {details.map((detail) => (
            <div key={detail.label} className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">{detail.label}</dt>
              <dd className="m-0 text-sm break-words">{detail.value}</dd>
            </div>
          ))}
        </dl>
        <Separator />
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Profiles</span>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {person.sameAs.map((href) => (
              <li key={href}>
                <a href={href} className="text-sm text-primary underline-offset-4 hover:underline">
                  {new URL(href).hostname.replace(/^www\./u, "")}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function PublicationsCard({ publications }: { publications: readonly PersonPublication[] }) {
  return (
    <Card className="gap-3 py-4">
      <CardHeader>
        <CardTitle className="text-base">Publications</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {publications.map((publication) => (
            <li key={publication.id} className="flex flex-col gap-0.5">
              <a
                href={publication.url}
                className="text-sm font-medium underline-offset-4 hover:underline"
              >
                {publication.title}
              </a>
              <span className="text-xs text-muted-foreground">
                {publication.venue} &middot; {publication.year}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/** `PersonProfile` and its experience → Schema.org `Person`. */
function toPersonJsonLd(person: PersonProfile) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    jobTitle: person.jobTitle,
    email: person.email,
    url: person.url,
    image: person.avatarUrl,
    address: person.location,
    description: person.bio,
    knowsAbout: person.skills,
    sameAs: person.sameAs,
    worksFor: {
      "@type": "Organization",
      name: person.worksFor,
    },
  };
}
