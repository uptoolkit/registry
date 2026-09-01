"use client";

import * as React from "react";

import { SearchFilter, type SearchFilterFacet, type SearchFilterValue } from "./search-filter";

const facets: readonly SearchFilterFacet[] = [
  {
    id: "category",
    legend: "Category",
    options: [
      { value: "Analytics", count: 2 },
      { value: "Monitoring", count: 2 },
      { value: "Infrastructure", count: 3 },
    ],
  },
  {
    id: "location",
    legend: "Location",
    options: [
      { value: "Remote", count: 5 },
      { value: "Berlin", count: 1 },
      { value: "Lisbon", count: 1 },
    ],
  },
];

export function Preview() {
  const [value, setValue] = React.useState<SearchFilterValue>({ query: "", selected: {} });

  return (
    <SearchFilter
      facets={facets}
      value={value}
      onChange={setValue}
      searchPlaceholder="Search listings..."
      className="w-full max-w-xs"
    />
  );
}
