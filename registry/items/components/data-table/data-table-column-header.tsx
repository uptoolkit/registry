"use client";

import {
  IconArrowDown,
  IconArrowsSort,
  IconArrowUp,
  IconEyeOff,
} from "@tabler/icons-react";
import type { Column } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import type { DataTableColumnMeta } from "../../lib/data-table-helpers/data-table";

type DataTableColumnHeaderProps<TData, TValue> = React.ComponentProps<"div"> & {
  column: Column<TData, TValue>;
  title: string;
};

function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const sorted = column.getIsSorted();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 h-8 data-[state=open]:bg-accent"
            />
          }
        >
          <span>{title}</span>
          {sorted === "desc" ? (
            <IconArrowDown aria-hidden="true" className="size-4" />
          ) : sorted === "asc" ? (
            <IconArrowUp aria-hidden="true" className="size-4" />
          ) : (
            <IconArrowsSort aria-hidden="true" className="size-4" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <IconArrowUp aria-hidden="true" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <IconArrowDown aria-hidden="true" />
            Desc
          </DropdownMenuItem>
          {column.getCanHide() ? (
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <IconEyeOff aria-hidden="true" />
              Hide
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function getColumnLabel<TData, TValue>(column: Column<TData, TValue>): string {
  const meta = column.columnDef.meta as DataTableColumnMeta | undefined;

  return meta?.label ?? column.id;
}

export { DataTableColumnHeader, getColumnLabel, type DataTableColumnHeaderProps };
