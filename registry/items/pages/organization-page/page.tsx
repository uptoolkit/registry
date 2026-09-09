import { IconBuildingFactory2, IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { JsonLd } from "../../components/json-ld/json-ld";
import {
  sampleOrganization,
  sampleOrganizationLocations,
  sampleOrganizationTeam,
  type Organization,
  type OrganizationLocation,
  type OrganizationMember,
} from "./organization-data";

/**
 * Organization detail page.
 *
 * One `Organization` record drives the header, stats, and a Schema.org
 * `Organization` node; locations and team come from two small sibling lists.
 * Everything stays a server component, so a real lookup slots straight in.
 */
export default function Page() {
  const organization = sampleOrganization;

  return (
    <main className="min-h-svh bg-muted/40">
      <JsonLd data={toOrganizationJsonLd(organization, sampleOrganizationLocations)} />

      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        <OrganizationHeaderCard organization={organization} />

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <AboutCard organization={organization} />
            <TeamGrid team={sampleOrganizationTeam} />
          </div>

          <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
            <ContactCard organization={organization} />
            <LocationsCard locations={sampleOrganizationLocations} />
          </aside>
        </div>
      </div>
    </main>
  );
}

function OrganizationHeaderCard({ organization }: { organization: Organization }) {
  const stats = [
    { label: "Founded", value: organization.foundingDate },
    { label: "Employees", value: organization.employeeCount },
    { label: "Industry", value: organization.industry },
  ];

  return (
    <Card className="gap-4 py-6">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="size-16 rounded-lg">
            <AvatarImage src={organization.logoUrl} alt="" />
            <AvatarFallback className="rounded-lg">
              <IconBuildingFactory2 aria-hidden="true" className="size-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h1 className="m-0 text-xl font-semibold tracking-tight">{organization.name}</h1>
            <p className="m-0 text-sm text-muted-foreground">{organization.tagline}</p>
            <dl className="m-0 mt-1 flex flex-wrap gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-1.5">
                  <dt className="order-2 text-sm text-muted-foreground">{stat.label}</dt>
                  <dd className="order-1 m-0 text-sm font-semibold">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <Button size="sm" nativeButton={false} render={<a href={organization.url} />}>
          Visit website
        </Button>
      </CardContent>
    </Card>
  );
}

function AboutCard({ organization }: { organization: Organization }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">About {organization.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="m-0 text-sm leading-relaxed text-muted-foreground">
          {organization.description}
        </p>
      </CardContent>
    </Card>
  );
}

function TeamGrid({ team }: { team: readonly OrganizationMember[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Team</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
          {team.map((member) => (
            <li key={member.id} className="flex items-center gap-3 rounded-lg border p-3">
              <Avatar className="size-10">
                <AvatarImage src={member.avatarUrl} alt="" />
                <AvatarFallback>{member.initials}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{member.name}</span>
                <span className="truncate text-xs text-muted-foreground">{member.role}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ContactCard({ organization }: { organization: Organization }) {
  return (
    <Card className="gap-3 py-4">
      <CardHeader>
        <CardTitle className="text-base">Contact</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          <li className="flex items-center gap-2 text-sm">
            <IconMail aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            <a
              href={`mailto:${organization.email}`}
              className="truncate underline-offset-4 hover:underline"
            >
              {organization.email}
            </a>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <IconPhone aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            <a
              href={`tel:${organization.telephone}`}
              className="truncate underline-offset-4 hover:underline"
            >
              {organization.telephone}
            </a>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}

function LocationsCard({ locations }: { locations: readonly OrganizationLocation[] }) {
  return (
    <Card className="gap-3 py-4">
      <CardHeader>
        <CardTitle className="text-base">Locations</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {locations.map((location) => (
            <li key={location.id} className="flex gap-2">
              <IconMapPin
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              />
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">{location.name}</span>
                  {location.isHeadquarters ? (
                    <Badge variant="secondary" className="text-[0.65rem]">
                      HQ
                    </Badge>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground">
                  {location.streetAddress}, {location.addressLocality}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/** `Organization` and its locations → Schema.org `Organization`. */
function toOrganizationJsonLd(
  organization: Organization,
  locations: readonly OrganizationLocation[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: organization.name,
    legalName: organization.legalName,
    description: organization.description,
    url: organization.url,
    logo: organization.logoUrl,
    foundingDate: organization.foundingDate,
    numberOfEmployees: organization.employeeCount,
    sameAs: organization.sameAs,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: organization.email,
      telephone: organization.telephone,
    },
    location: locations.map((location) => ({
      "@type": "Place",
      name: location.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: location.streetAddress,
        addressLocality: location.addressLocality,
        addressCountry: location.addressCountry,
      },
    })),
  };
}
