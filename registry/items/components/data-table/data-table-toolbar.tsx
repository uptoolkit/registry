"use client";

import { IconAdjustmentsHorizontal, IconColumns, IconSearch, IconX } from "@tabler/icons-react";
import type { Column, Table as TanstackTable } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import type { DataTableColumnMeta } from "../../lib/data-table-helpers/data-table";
import { getColumnLabel } from "./data-table-column-header";

type DataTableToolbarProps<TData> = {
  table: TanstackTable<TData>;
  searchPlaceholder?: string;
  className?: string;
};

function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Search...",
  className,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || Boolean(table.getState().globalFilter);
  const filterableColumns = table
    .getAllColumns()
    .filter((column) => Boolean((column.columnDef.meta as DataTableColumnMeta | undefined)?.filter));

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <IconSearch
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={table.getState().globalFilter ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search table"
            className="pl-8"
          />
        </div>

        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline" size="sm">
                <IconAdjustmentsHorizontal aria-hidden="true" />
                Filters
                {table.getState().columnFilters.length > 0 ? (
                  <Badge variant="secondary">{table.getState().columnFilters.length}</Badge>
                ) : null}
              </Button>
            }
          />
          <PopoverContent align="start" className="w-80 space-y-4">
            {filterableColumns.length === 0 ? (
              <p className="m-0 text-sm text-muted-foreground">No column filters configured.</p>
            ) : (
              filterableColumns.map((column) => (
                <ColumnFilterControl key={column.id} column={column} />
              ))
            )}
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            <IconColumns aria-hidden="true" />
            Columns
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
                >
                  {getColumnLabel(column)}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {isFiltered ? (
          <Button variant="ghost" size="sm" onClick={() => table.resetColumnFilters()}>
            <IconX aria-hidden="true" />
            Reset
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ColumnFilterControl<TData>({ column }: { column: Column<TData, unknown> }) {
  const meta = column.columnDef.meta as DataTableColumnMeta | undefined;
  const filter = meta?.filter;

  if (!filter) {
    return null;
  }

  const value = column.getFilterValue();

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium">{meta?.label ?? column.id}</Label>

      {filter.type === "text" ? (
        <Input
          value={typeof value === "string" ? value : ""}
          placeholder={filter.placeholder ?? "Filter..."}
          onChange={(event) => column.setFilterValue(event.target.value)}
        />
      ) : null}

      {filter.type === "boolean" ? (
        <Select
          value={value === undefined ? "all" : value === true ? "true" : "false"}
          onValueChange={(next: string | null) => {
            if (!next || next === "all") {
              column.setFilterValue(undefined);
              return;
            }

            column.setFilterValue(next === "true");
          }}
        >
          <SelectTrigger size="sm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      ) : null}

      {filter.type === "select" ? (
        <Select
          value={typeof value === "string" ? value : ""}
          onValueChange={(next: string | null) => column.setFilterValue(next || undefined)}
        >
          <SelectTrigger size="sm" className="w-full">
            <SelectValue placeholder={filter.placeholder ?? "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {(filter.options ?? []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {filter.type === "multiselect" ? (
        <div className="flex flex-col gap-2">
          {(filter.options ?? []).map((option) => {
            const selected = Array.isArray(value) ? value.includes(option.value) : false;

            return (
              <label key={option.value} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selected}
                  onCheckedChange={(checked) => {
                    const current = Array.isArray(value) ? value : [];
                    column.setFilterValue(
                      checked
                        ? [...current, option.value]
                        : current.filter((entry) => entry !== option.value),
                    );
                  }}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export { DataTableToolbar, type DataTableToolbarProps };
