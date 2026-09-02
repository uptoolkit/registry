"use client";

import * as React from "react";

import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
  type VisibilityState,
} from "@tanstack/react-table";

import {
  dataTableStateToCrudQuery,
  defaultDataTableState,
  type DataTableState,
} from "../../lib/data-table-helpers/data-table";
import type { ApiPlatformCollection, CrudQueryState } from "../../lib/api-platform-crud/api-platform-crud";

type UseCrudDataTableOptions<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data?: TData[];
  /** Total items for server-side pagination. */
  rowCount?: number;
  /** Server-side mode when true. */
  manual?: boolean;
  pageSize?: number;
  state?: Partial<DataTableState>;
  onStateChange?: (state: DataTableState) => void;
  onQueryChange?: (query: CrudQueryState) => void;
  getRowId?: (row: TData) => string;
};

type UseCrudDataTableResult<TData> = {
  table: TanstackTable<TData>;
  state: DataTableState;
  query: CrudQueryState;
  setSorting: OnChangeFn<SortingState>;
  setColumnFilters: OnChangeFn<ColumnFiltersState>;
  setColumnVisibility: OnChangeFn<VisibilityState>;
  setRowSelection: OnChangeFn<RowSelectionState>;
  setPagination: OnChangeFn<PaginationState>;
  setGlobalFilter: (value: string) => void;
};

/**
 * TanStack Table hook wired for API Platform CRUD collections.
 *
 * In `manual` mode sorting, filtering, pagination, and search are delegated to
 * the server. `onQueryChange` receives the API Platform query built from the
 * current table state via `buildApiPlatformQuery`.
 */
function useCrudDataTable<TData>({
  columns,
  data = [],
  rowCount,
  manual = false,
  pageSize = 10,
  state: controlledState,
  onStateChange,
  onQueryChange,
  getRowId,
}: UseCrudDataTableOptions<TData>): UseCrudDataTableResult<TData> {
  const [state, setState] = React.useState<DataTableState>(() => ({
    ...defaultDataTableState(pageSize),
    ...controlledState,
  }));

  const query = React.useMemo(
    () => dataTableStateToCrudQuery(state, columns as ColumnDef<unknown, unknown>[]),
    [columns, state],
  );

  React.useEffect(() => {
    onQueryChange?.(query);
  }, [onQueryChange, query]);

  const update = React.useCallback(
    (patch: Partial<DataTableState>) => {
      setState((current) => {
        const next = { ...current, ...patch };
        onStateChange?.(next);
        return next;
      });
    },
    [onStateChange],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: state.sorting,
      columnFilters: state.columnFilters,
      columnVisibility: state.columnVisibility,
      rowSelection: state.rowSelection,
      pagination: state.pagination,
      globalFilter: state.globalFilter,
    },
    manualPagination: manual,
    manualSorting: manual,
    manualFiltering: manual,
    rowCount: manual ? rowCount : undefined,
    enableRowSelection: true,
    onSortingChange: (updater) => {
      const sorting = typeof updater === "function" ? updater(state.sorting) : updater;
      update({ sorting, pagination: { ...state.pagination, pageIndex: 0 } });
    },
    onColumnFiltersChange: (updater) => {
      const columnFilters =
        typeof updater === "function" ? updater(state.columnFilters) : updater;
      update({ columnFilters, pagination: { ...state.pagination, pageIndex: 0 } });
    },
    onColumnVisibilityChange: (updater) => {
      const columnVisibility =
        typeof updater === "function" ? updater(state.columnVisibility) : updater;
      update({ columnVisibility });
    },
    onRowSelectionChange: (updater) => {
      const rowSelection =
        typeof updater === "function" ? updater(state.rowSelection) : updater;
      update({ rowSelection });
    },
    onPaginationChange: (updater) => {
      const pagination = typeof updater === "function" ? updater(state.pagination) : updater;
      update({ pagination });
    },
    onGlobalFilterChange: (value) => {
      update({ globalFilter: String(value), pagination: { ...state.pagination, pageIndex: 0 } });
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: manual ? undefined : getFilteredRowModel(),
    getSortedRowModel: manual ? undefined : getSortedRowModel(),
    getPaginationRowModel: manual ? undefined : getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId,
  });

  return {
    table,
    state,
    query,
    setSorting: table.setSorting,
    setColumnFilters: table.setColumnFilters,
    setColumnVisibility: table.setColumnVisibility,
    setRowSelection: table.setRowSelection,
    setPagination: table.setPagination,
    setGlobalFilter: table.setGlobalFilter,
  };
}

export {
  useCrudDataTable,
  type ApiPlatformCollection,
  type CrudQueryState,
  type UseCrudDataTableOptions,
  type UseCrudDataTableResult,
};
