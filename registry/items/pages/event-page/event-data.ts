/** The event the page is about, modeled on schema.org/Event. */
export type Event = {
  name: string;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  timezone: string;
  status: "scheduled" | "postponed" | "cancelled";
  attendanceMode: "offline" | "online" | "mixed";
  venueName: string;
  streetAddress: string;
  addressLocality: string;
  addressCountry: string;
  organizerName: string;
  organizerUrl: string;
  price: number;
  currency: string;
  availability: "in-stock" | "sold-out" | "limited";
  capacity: number;
  registered: number;
};

export type EventSpeaker = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  initials: string;
};

export type EventScheduleItem = {
  id: string;
  time: string;
  title: string;
  speakerId?: string;
};

export const sampleEvent: Event = {
  name: "Fatigue & Fracture Summit 2026",
  description:
    "A one-day summit on fatigue testing for additively manufactured metals, with case studies from aerospace and medical device teams.",
  imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
  startDate: "2026-04-14T09:00:00-07:00",
  endDate: "2026-04-14T17:30:00-07:00",
  timezone: "America/Los_Angeles",
  status: "scheduled",
  attendanceMode: "mixed",
  venueName: "Northbeam Labs — Portland Campus",
  streetAddress: "412 SE Industrial Way",
  addressLocality: "Portland, OR",
  addressCountry: "US",
  organizerName: "Northbeam Labs",
  organizerUrl: "https://northbeamlabs.example.com",
  price: 249,
  currency: "USD",
  availability: "limited",
  capacity: 180,
  registered: 152,
};

export const sampleEventSpeakers: readonly EventSpeaker[] = [
  {
    id: "speaker-1",
    name: "Marisol Ferreira",
    role: "Principal Materials Scientist, Northbeam Labs",
    avatarUrl: "https://github.com/shadcn.png",
    initials: "MF",
  },
  {
    id: "speaker-2",
    name: "Theo Larsen",
    role: "Head of Test Engineering, Northbeam Labs",
    avatarUrl: "https://github.com/torvalds.png",
    initials: "TL",
  },
  {
    id: "speaker-3",
    name: "Priya Nair",
    role: "Director of Quality, Halden Aerostructures",
    avatarUrl: "https://github.com/gaearon.png",
    initials: "PN",
  },
];

export const sampleEventSchedule: readonly EventScheduleItem[] = [
  { id: "schedule-1", time: "09:00", title: "Doors open & registration" },
  {
    id: "schedule-2",
    time: "09:30",
    title: "Keynote: A decade of fatigue data, revisited",
    speakerId: "speaker-1",
  },
  {
    id: "schedule-3",
    time: "10:45",
    title: "Surface roughness and as-built S-N curves",
    speakerId: "speaker-2",
  },
  { id: "schedule-4", time: "12:00", title: "Lunch & lab tours" },
  {
    id: "schedule-5",
    time: "13:30",
    title: "Qualifying additive parts for flight hardware",
    speakerId: "speaker-3",
  },
  { id: "schedule-6", time: "15:00", title: "Panel: what standards still get wrong" },
  { id: "schedule-7", time: "16:30", title: "Closing remarks & networking" },
];

export function formatEventDateRange(event: Pick<Event, "startDate" | "endDate">): string {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeStyle: "short",
  });

  return `${dateFormatter.format(start)} · ${timeFormatter.format(start)} – ${timeFormatter.format(end)}`;
}

export function formatEventPrice(event: Pick<Event, "price" | "currency">): string {
  if (event.price === 0) {
    return "Free";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: event.currency,
    maximumFractionDigits: 0,
  }).format(event.price);
}
