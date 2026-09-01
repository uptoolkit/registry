"use client";

import { IconSearch, IconX } from "@tabler/icons-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type SearchFilterOption = {
  value: string;
  /** Defaults to `value`. */
  label?: string;
  count?: number;
};

type SearchFilterFacet = {
  id: string;
  legend: string;
  options: readonly SearchFilterOption[];
};

type SearchFilterValue = {
  query: string;
  /** Selected option values, keyed by facet id. */
  selected: Record<string, readonly string[]>;
};

type SearchFilterProps = {
  facets?: readonly SearchFilterFacet[];
  /** Controlled value. Omit to let the filter manage its own state. */
  value?: SearchFilterValue;
  defaultValue?: SearchFilterValue;
  onChange?: (value: SearchFilterValue) => void;
  title?: string;
  searchLabel?: string;
  searchPlaceholder?: string;
  className?: string;
};

const emptyValue: SearchFilterValue = { query: "", selected: {} };

/**
 * Search box plus faceted toggle-button filters: a title with a conditional
 * Clear action, a search field, and one group per facet with per-option
 * counts. Domain-agnostic — pass whatever `facets` your list needs and read
 * `value` back to filter it yourself.
 *
 * State is uncontrolled by default; pass `value` and `onChange` to drive it
 * from a search param or your own query state instead.
 */
function SearchFilter({
  facets = [],
  value: controlledValue,
  defaultValue = emptyValue,
  onChange,
  title = "Filters",
  searchLabel = "Search",
  searchPlaceholder = "Search...",
  className,
}: SearchFilterProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const searchId = React.useId();
  const value = controlledValue ?? uncontrolledValue;

  function commit(next: SearchFilterValue) {
    if (controlledValue === undefined) {
      setUncontrolledValue(next);
    }

    onChange?.(next);
  }

  function setQuery(query: string) {
    commit({ ...value, query });
  }

  function toggleOption(facetId: string, optionValue: string) {
    const current = value.selected[facetId] ?? [];
    const next = current.includes(optionValue)
      ? current.filter((entry) => entry !== optionValue)
      : [...current, optionValue];

    commit({ ...value, selected: { ...value.selected, [facetId]: next } });
  }

  function clear() {
    commit(emptyValue);
  }

  const activeFilterCount =
    (value.query.trim() ? 1 : 0) +
    Object.values(value.selected).reduce((total, selected) => total + selected.length, 0);

  return (
    <Card className={cn("gap-4 py-4", className)}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        {activeFilterCount > 0 ? (
          <Button type="button" variant="ghost" size="xs" onClick={clear}>
            <IconX aria-hidden="true" />
            Clear
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={searchId}>{searchLabel}</Label>
          <div className="relative">
            <IconSearch
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id={searchId}
              value={value.query}
              placeholder={searchPlaceholder}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-7"
            />
          </div>
        </div>

        {facets.map((facet) => (
          <React.Fragment key={facet.id}>
            <Separator />
            <FacetGroup
              facet={facet}
              selected={value.selected[facet.id] ?? []}
              onToggle={(optionValue) => toggleOption(facet.id, optionValue)}
            />
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
}

function FacetGroup({
  facet,
  selected,
  onToggle,
}: {
  facet: SearchFilterFacet;
  selected: readonly string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2 border-0 p-0">
      <legend className="mb-1 text-sm font-medium">{facet.legend}</legend>
      {facet.options.map((option) => {
        const isSelected = selected.includes(option.value);

        return (
          <Button
            key={option.value}
            type="button"
            variant={isSelected ? "secondary" : "ghost"}
            size="sm"
            aria-pressed={isSelected}
            className="justify-between"
            onClick={() => onToggle(option.value)}
          >
            <span>{option.label ?? option.value}</span>
            {option.count === undefined ? null : <Badge variant="outline">{option.count}</Badge>}
          </Button>
        );
      })}
    </fieldset>
  );
}

export {
  SearchFilter,
  type SearchFilterFacet,
  type SearchFilterOption,
  type SearchFilterProps,
  type SearchFilterValue,
};
