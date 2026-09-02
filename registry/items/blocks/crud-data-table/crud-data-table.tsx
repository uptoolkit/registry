"use client";

import { IconPlus, IconTrash } from "@tabler/icons-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { DataTable } from "../../components/data-table/data-table";
import { DataTablePagination } from "../../components/data-table/data-table-pagination";
import { DataTableToolbar } from "../../components/data-table/data-table-toolbar";
import {
  fetchApiPlatformCollection,
  getApiPlatformItemId,
  type ApiPlatformCollection,
  type CrudQueryState,
} from "../../lib/api-platform-crud/api-platform-crud";
import { useCrudDataTable } from "../../hooks/use-crud-data-table/use-crud-data-table";
import {
  createBookColumns,
  sampleBooks,
  type Book,
} from "./crud-sample-data";

type CrudDataTableProps = {
  /** API Platform collection endpoint, for example `/api/books`. */
  endpoint?: string;
  /** Column definitions. Defaults to the sample book columns. */
  columns?: ReturnType<typeof createBookColumns>;
  /** Client-side data for previews and local CRUD. */
  data?: Book[];
  /** Total items when using server-side pagination. */
  totalItems?: number;
  /** Force server-side mode. Inferred when `endpoint` is set. */
  manual?: boolean;
  heading?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  className?: string;
  onCreate?: () => void;
  onEdit?: (row: Book) => void;
  onDelete?: (row: Book) => void;
  onBulkDelete?: (rows: Book[]) => void;
  /** Called whenever the API Platform query changes. */
  onQueryChange?: (query: CrudQueryState) => void;
  /** Custom fetcher for non-default API clients. */
  fetchCollection?: (
    endpoint: string,
    query: CrudQueryState,
  ) => Promise<ApiPlatformCollection<Book>>;
};

/**
 * Full CRUD data table built on TanStack Table.
 *
 * Ships with search, customizable column filters, multiselect, column
 * visibility, sorting, and pagination. In server mode it builds API Platform
 * query strings (`page`, `itemsPerPage`, `order[field]`, filters, `search`).
 */
function CrudDataTable({
  endpoint,
  columns: columnsProp,
  data: dataProp,
  totalItems: totalItemsProp,
  manual,
  heading = "Records",
  searchPlaceholder = "Search records...",
  pageSize = 10,
  className,
  onCreate,
  onEdit,
  onDelete,
  onBulkDelete,
  onQueryChange,
  fetchCollection = fetchApiPlatformCollection,
}: CrudDataTableProps) {
  const isServer = manual ?? Boolean(endpoint);
  const columns = React.useMemo(
    () => columnsProp ?? createBookColumns({ onEdit, onDelete }),
    [columnsProp, onDelete, onEdit],
  );

  const [serverData, setServerData] = React.useState<Book[]>(dataProp ?? []);
  const [serverTotal, setServerTotal] = React.useState(totalItemsProp ?? 0);
  const [loading, setLoading] = React.useState(false);

  const { table, query } = useCrudDataTable<Book>({
    columns,
    data: isServer ? serverData : (dataProp ?? sampleBooks),
    rowCount: isServer ? serverTotal : undefined,
    manual: isServer,
    pageSize,
    onQueryChange,
    getRowId: (row) => getApiPlatformItemId(row as unknown as Record<string, unknown>) || String(row.id),
  });

  React.useEffect(() => {
    if (!isServer || !endpoint) {
      return;
    }

    let cancelled = false;

    async function load() {
      if (!endpoint) {
        return;
      }

      setLoading(true);

      try {
        const collection = await fetchCollection(endpoint, query);
        if (!cancelled) {
          setServerData(collection.member);
          setServerTotal(collection.totalItems);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [endpoint, fetchCollection, isServer, query]);

  const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);

  return (
    <section aria-label={heading} className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 text-lg font-semibold">{heading}</h2>
          {isServer && endpoint ? (
            <p className="m-0 font-mono text-xs text-muted-foreground">{endpoint}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {selectedRows.length > 0 && onBulkDelete ? (
            <Button variant="destructive" size="sm" onClick={() => onBulkDelete(selectedRows)}>
              <IconTrash aria-hidden="true" />
              Delete ({selectedRows.length})
            </Button>
          ) : null}
          {onCreate ? (
            <Button size="sm" onClick={onCreate}>
              <IconPlus aria-hidden="true" />
              Create
            </Button>
          ) : null}
        </div>
      </div>

      <DataTableToolbar table={table} searchPlaceholder={searchPlaceholder} />

      <div className={cn(loading && "opacity-60")}>
        <DataTable table={table} emptyMessage={loading ? "Loading..." : "No results."} />
      </div>

      <DataTablePagination table={table} />
    </section>
  );
}

export { CrudDataTable, type CrudDataTableProps };
