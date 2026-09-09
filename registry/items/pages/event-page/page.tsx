import { IconCalendar, IconMapPin, IconTicket, IconUsers } from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { JsonLd } from "../../components/json-ld/json-ld";
import {
  formatEventDateRange,
  formatEventPrice,
  sampleEvent,
  sampleEventSchedule,
  sampleEventSpeakers,
  type Event,
  type EventScheduleItem,
  type EventSpeaker,
} from "./event-data";

const availabilityLabels = {
  "in-stock": "Tickets available",
  limited: "Limited tickets left",
  "sold-out": "Sold out",
} as const satisfies Record<Event["availability"], string>;

/**
 * Event detail page.
 *
 * One `Event` record drives the banner, details rail, and Schema.org `Event`
 * node; the schedule and speaker list are two small sibling arrays joined on
 * `speakerId`. Replace `sampleEvent` with a lookup and this stays a server
 * component throughout.
 */
export default function Page() {
  const event = sampleEvent;
  const speakersById = new Map(sampleEventSpeakers.map((speaker) => [speaker.id, speaker]));

  return (
    <main className="min-h-svh bg-muted/40">
      <JsonLd data={toEventJsonLd(event)} />

      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        <EventHeaderCard event={event} />

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <AboutCard event={event} />
            <ScheduleCard schedule={sampleEventSchedule} speakersById={speakersById} />
            <SpeakersGrid speakers={sampleEventSpeakers} />
          </div>

          <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
            <DetailsCard event={event} />
          </aside>
        </div>
      </div>
    </main>
  );
}

function EventHeaderCard({ event }: { event: Event }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <img src={event.imageUrl} alt="" className="h-48 w-full object-cover" />
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div className="flex flex-col gap-2">
          <Badge
            variant={event.availability === "sold-out" ? "outline" : "secondary"}
            className="w-fit"
          >
            {availabilityLabels[event.availability]}
          </Badge>
          <h1 className="m-0 text-xl font-semibold tracking-tight">{event.name}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <IconCalendar aria-hidden="true" className="size-4" />
              {formatEventDateRange(event)}
            </span>
            <span className="flex items-center gap-1.5">
              <IconMapPin aria-hidden="true" className="size-4" />
              {event.venueName}
            </span>
          </div>
        </div>

        <Button nativeButton={false} render={<a href={`${event.organizerUrl}/register`} />}>
          Register — {formatEventPrice(event)}
        </Button>
      </CardContent>
    </Card>
  );
}

function AboutCard({ event }: { event: Event }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">About this event</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="m-0 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
      </CardContent>
    </Card>
  );
}

function ScheduleCard({
  schedule,
  speakersById,
}: {
  schedule: readonly EventScheduleItem[];
  speakersById: ReadonlyMap<string, EventSpeaker>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="m-0 flex list-none flex-col gap-0 p-0">
          {schedule.map((item, index) => {
            const speaker = item.speakerId ? speakersById.get(item.speakerId) : undefined;

            return (
              <li key={item.id} className="flex gap-3">
                <span className="w-14 shrink-0 pt-0.5 text-xs text-muted-foreground tabular-nums">
                  {item.time}
                </span>
                <div className="flex flex-col items-center">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  {index < schedule.length - 1 ? (
                    <span className="w-px flex-1 bg-border" aria-hidden />
                  ) : null}
                </div>
                <div className="flex flex-col gap-0.5 pb-5">
                  <span className="text-sm font-medium">{item.title}</span>
                  {speaker ? (
                    <span className="text-xs text-muted-foreground">{speaker.name}</span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

function SpeakersGrid({ speakers }: { speakers: readonly EventSpeaker[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Speakers</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
          {speakers.map((speaker) => (
            <li key={speaker.id} className="flex items-center gap-3 rounded-lg border p-3">
              <Avatar className="size-10">
                <AvatarImage src={speaker.avatarUrl} alt="" />
                <AvatarFallback>{speaker.initials}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{speaker.name}</span>
                <span className="truncate text-xs text-muted-foreground">{speaker.role}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function DetailsCard({ event }: { event: Event }) {
  const seatsLeft = event.capacity - event.registered;

  return (
    <Card className="gap-3 py-4">
      <CardHeader>
        <CardTitle className="text-base">Details</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm">
          <IconTicket aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <span>{formatEventPrice(event)} per ticket</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <IconUsers aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <span>
            {event.registered}/{event.capacity} registered &middot; {seatsLeft} left
          </span>
        </div>
        <Separator />
        <dl className="m-0 flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">Venue</dt>
            <dd className="m-0 text-sm">
              {event.venueName}
              <br />
              {event.streetAddress}, {event.addressLocality}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">Organizer</dt>
            <dd className="m-0 text-sm">
              <a href={event.organizerUrl} className="underline-offset-4 hover:underline">
                {event.organizerName}
              </a>
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

const attendanceModeUrls = {
  offline: "https://schema.org/OfflineEventAttendanceMode",
  online: "https://schema.org/OnlineEventAttendanceMode",
  mixed: "https://schema.org/MixedEventAttendanceMode",
} as const satisfies Record<Event["attendanceMode"], string>;

const eventStatusUrls = {
  scheduled: "https://schema.org/EventScheduled",
  postponed: "https://schema.org/EventPostponed",
  cancelled: "https://schema.org/EventCancelled",
} as const satisfies Record<Event["status"], string>;

const availabilityUrls = {
  "in-stock": "https://schema.org/InStock",
  limited: "https://schema.org/LimitedAvailability",
  "sold-out": "https://schema.org/SoldOut",
} as const satisfies Record<Event["availability"], string>;

/** `Event` → Schema.org `Event`, with `offers` describing the ticket. */
function toEventJsonLd(event: Event) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description,
    image: event.imageUrl,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: eventStatusUrls[event.status],
    eventAttendanceMode: attendanceModeUrls[event.attendanceMode],
    location: {
      "@type": "Place",
      name: event.venueName,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.streetAddress,
        addressLocality: event.addressLocality,
        addressCountry: event.addressCountry,
      },
    },
    organizer: {
      "@type": "Organization",
      name: event.organizerName,
      url: event.organizerUrl,
    },
    offers: {
      "@type": "Offer",
      price: event.price,
      priceCurrency: event.currency,
      availability: availabilityUrls[event.availability],
      url: `${event.organizerUrl}/register`,
    },
  };
}
