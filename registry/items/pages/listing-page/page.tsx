import { Button } from "@/components/ui/button";

import { ListingBrowser } from "./listing-browser";
import { sampleListings } from "./listing-data";

/**
 * Listing page shell.
 *
 * The page itself stays a server component: it renders the heading and hands
 * the records to `ListingBrowser`, which owns the search, facet, sort, and
 * pagination state on the client. Replace `sampleListings` with your own query.
 */
export default function Page() {
  const listings = sampleListings;

  return (
    <main className="min-h-svh bg-muted/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="m-0 text-2xl font-semibold tracking-tight">Listings</h1>
            <p className="m-0 text-sm text-muted-foreground">
              Browse {listings.length} tools. Filter by category and location, then sort the
              results.
            </p>
          </div>
          <Button>Submit a listing</Button>
        </header>

        <ListingBrowser listings={listings} />
      </div>
    </main>
  );
}
