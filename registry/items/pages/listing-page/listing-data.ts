/** A single row in the listing. Swap this for your own record shape. */
export type Listing = {
  id: string;
  title: string;
  summary: string;
  category: string;
  location: string;
  price: number;
  rating: number;
  updatedAt: string;
  featured?: boolean;
};

export type ListingSort = "relevance" | "price-asc" | "price-desc" | "rating";

export const listingSortOptions = [
  { value: "relevance", label: "Most relevant" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
] as const satisfies readonly { value: ListingSort; label: string }[];

export const sampleListings: readonly Listing[] = [
  {
    id: "atlas-analytics",
    title: "Atlas Analytics",
    summary: "Self-hosted product analytics with a warehouse-native event model.",
    category: "Analytics",
    location: "Remote",
    price: 49,
    rating: 4.8,
    updatedAt: "2 days ago",
    featured: true,
  },
  {
    id: "beacon-status",
    title: "Beacon Status",
    summary: "Status pages and incident timelines that stay up when you do not.",
    category: "Monitoring",
    location: "Berlin",
    price: 19,
    rating: 4.5,
    updatedAt: "5 days ago",
  },
  {
    id: "cadence-scheduler",
    title: "Cadence Scheduler",
    summary: "Cron jobs with retries, backfills, and an audit trail per run.",
    category: "Infrastructure",
    location: "Remote",
    price: 0,
    rating: 4.2,
    updatedAt: "1 week ago",
  },
  {
    id: "drift-cms",
    title: "Drift CMS",
    summary: "Git-backed content modeling with typed queries and previews.",
    category: "Content",
    location: "Lisbon",
    price: 79,
    rating: 4.6,
    updatedAt: "1 week ago",
    featured: true,
  },
  {
    id: "ember-mail",
    title: "Ember Mail",
    summary: "Transactional email templates you can render and test locally.",
    category: "Content",
    location: "Remote",
    price: 29,
    rating: 4.1,
    updatedAt: "2 weeks ago",
  },
  {
    id: "flux-queue",
    title: "Flux Queue",
    summary: "A durable job queue with exactly-once delivery semantics.",
    category: "Infrastructure",
    location: "Toronto",
    price: 39,
    rating: 4.7,
    updatedAt: "3 weeks ago",
  },
  {
    id: "grid-insights",
    title: "Grid Insights",
    summary: "Dashboards that compile to static charts at build time.",
    category: "Analytics",
    location: "Remote",
    price: 0,
    rating: 3.9,
    updatedAt: "1 month ago",
  },
  {
    id: "halo-uptime",
    title: "Halo Uptime",
    summary: "Synthetic checks from twelve regions with alert deduplication.",
    category: "Monitoring",
    location: "Sydney",
    price: 25,
    rating: 4.4,
    updatedAt: "1 month ago",
  },
  {
    id: "ion-search",
    title: "Ion Search",
    summary: "Typo-tolerant search that indexes straight from your database.",
    category: "Infrastructure",
    location: "Remote",
    price: 59,
    rating: 4.9,
    updatedAt: "2 months ago",
  },
];

/** Distinct facet values with counts, derived from the listings themselves. */
export function getListingFacets(
  listings: readonly Listing[],
  key: "category" | "location",
): { value: string; count: number }[] {
  const counts = new Map<string, number>();

  for (const listing of listings) {
    counts.set(listing[key], (counts.get(listing[key]) ?? 0) + 1);
  }

  return Array.from(counts, ([value, count]) => ({ value, count })).toSorted((a, b) =>
    a.value.localeCompare(b.value),
  );
}

export function filterListings(
  listings: readonly Listing[],
  { query, categories, locations }: { query: string; categories: string[]; locations: string[] },
): Listing[] {
  const normalizedQuery = query.trim().toLowerCase();

  return listings.filter((listing) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      `${listing.title} ${listing.summary}`.toLowerCase().includes(normalizedQuery);
    const matchesCategory = categories.length === 0 || categories.includes(listing.category);
    const matchesLocation = locations.length === 0 || locations.includes(listing.location);

    return matchesQuery && matchesCategory && matchesLocation;
  });
}

const listingComparators = {
  relevance: (a: Listing, b: Listing) => Number(b.featured ?? false) - Number(a.featured ?? false),
  "price-asc": (a: Listing, b: Listing) => a.price - b.price,
  "price-desc": (a: Listing, b: Listing) => b.price - a.price,
  rating: (a: Listing, b: Listing) => b.rating - a.rating,
} as const satisfies Record<ListingSort, (a: Listing, b: Listing) => number>;

export function sortListings(listings: readonly Listing[], sort: ListingSort): Listing[] {
  return [...listings].toSorted(listingComparators[sort]);
}

export function formatListingPrice(price: number): string {
  return price === 0 ? "Free" : `$${price}/mo`;
}
