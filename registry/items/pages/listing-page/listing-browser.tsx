"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import {
  filterListings,
  formatListingPrice,
  getListingFacets,
  listingSortOptions,
  sortListings,
  type Listing,
  type ListingSort,
} from "./listing-data";

type ListingBrowserProps = {
  listings: readonly Listing[];
  /** Results per page. */
  pageSize?: number;
};

/**
 * Client half of the listing page: search, facets, sorting, and pagination all
 * run against the `listings` prop, so the server component above can fetch
 * however it likes and stay a server component.
 */
function ListingBrowser({ listings, pageSize = 4 }: ListingBrowserProps) {
  const [query, setQuery] = React.useState("");
  const [categories, setCategories] = React.useState<string[]>([]);
  const [locations, setLocations] = React.useState<string[]>([]);
  const [sort, setSort] = React.useState<ListingSort>("relevance");
  const [page, setPage] = React.useState(1);

  const categoryFacets = React.useMemo(() => getListingFacets(listings, "category"), [listings]);
  const locationFacets = React.useMemo(() => getListingFacets(listings, "location"), [listings]);

  const results = React.useMemo(
    () => sortListings(filterListings(listings, { query, categories, locations }), sort),
    [listings, query, categories, locations, sort],
  );

  const pageCount = Math.max(1, Math.ceil(results.length / pageSize));
  // Filters can shrink the result set below the active page; clamp instead of
  // resetting so the visible page never goes blank.
  const currentPage = Math.min(page, pageCount);
  const visibleResults = results.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeFilterCount = categories.length + locations.length + (query.trim() ? 1 : 0);

  function toggleFacet(
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
  ) {
    setPage(1);
    setSelected(
      selected.includes(value) ? selected.filter((entry) => entry !== value) : [...selected, value],
    );
  }

  function clearFilters() {
    setQuery("");
    setCategories([]);
    setLocations([]);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-64">
        <Card className="gap-4 py-4">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Filters</CardTitle>
            {activeFilterCount > 0 ? (
              <Button variant="ghost" size="xs" onClick={clearFilters}>
                Clear
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="listing-search">Search</Label>
              <Input
                id="listing-search"
                value={query}
                placeholder="Search listings..."
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            <Separator />

            <FacetGroup
              legend="Category"
              facets={categoryFacets}
              selected={categories}
              onToggle={(value) => toggleFacet(value, categories, setCategories)}
            />

            <Separator />

            <FacetGroup
              legend="Location"
              facets={locationFacets}
              selected={locations}
              onToggle={(value) => toggleFacet(value, locations, setLocations)}
            />
          </CardContent>
        </Card>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="m-0 text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          <div className="flex flex-wrap items-center gap-1">
            {listingSortOptions.map((option) => (
              <Button
                key={option.value}
                variant={sort === option.value ? "secondary" : "ghost"}
                size="sm"
                aria-pressed={sort === option.value}
                onClick={() => {
                  setSort(option.value);
                  setPage(1);
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {visibleResults.length === 0 ? (
          <Card className="items-center py-12 text-center">
            <CardContent className="flex flex-col items-center gap-2">
              <p className="m-0 text-sm font-medium">No listings match those filters</p>
              <p className="m-0 text-sm text-muted-foreground">
                Try a broader search or clear a facet.
              </p>
              <Button variant="outline" size="sm" className="mt-2" onClick={clearFilters}>
                Clear filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
            {visibleResults.map((listing) => (
              <li key={listing.id}>
                <ListingCard listing={listing} />
              </li>
            ))}
          </ul>
        )}

        <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
      </div>
    </div>
  );
}

function FacetGroup({
  legend,
  facets,
  selected,
  onToggle,
}: {
  legend: string;
  facets: readonly { value: string; count: number }[];
  selected: readonly string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2 border-0 p-0">
      <legend className="mb-1 text-sm font-medium">{legend}</legend>
      {facets.map((facet) => {
        const isSelected = selected.includes(facet.value);

        return (
          <Button
            key={facet.value}
            variant={isSelected ? "secondary" : "ghost"}
            size="sm"
            aria-pressed={isSelected}
            className="justify-between"
            onClick={() => onToggle(facet.value)}
          >
            <span>{facet.value}</span>
            <span className="text-muted-foreground">{facet.count}</span>
          </Button>
        );
      })}
    </fieldset>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Card className="h-full gap-3">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{listing.title}</CardTitle>
          {listing.featured ? <Badge variant="secondary">Featured</Badge> : null}
        </div>
        <CardDescription>{listing.summary}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline">{listing.category}</Badge>
        <span>{listing.location}</span>
        <span aria-hidden>&middot;</span>
        <span>{listing.rating.toFixed(1)} &#9733;</span>
        <span aria-hidden>&middot;</span>
        <span className="font-medium text-foreground">{formatListingPrice(listing.price)}</span>
        <span className="ml-auto text-xs">Updated {listing.updatedAt}</span>
      </CardContent>
    </Card>
  );
}

function Pagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <p className="m-0 text-sm text-muted-foreground">
        Page {page} of {pageCount}
      </p>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  );
}

export { ListingBrowser, type ListingBrowserProps };
