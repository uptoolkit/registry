/**
 * Shared data-table types and helpers for TanStack Table + API Platform CRUD.
 */

import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

import type { CrudFilter, CrudQueryState, CrudSort } from "../api-platform-crud/api-platform-crud";

type DataTableFilterType = "text" | "select" | "multiselect" | "boolean" | "date";

type DataTableFilterOption = {
  label: string;
  value: string;
};

type DataTableColumnMeta = {
  label?: string;
  filter?: {
    type: DataTableFilterType;
    placeholder?: string;
    options?: readonly DataTableFilterOption[];
    /** Maps to API Platform filter operator. */
    operator?: CrudFilter["operator"];
    /** API Platform property name when it differs from column id. */
    property?: string;
  };
  /** Exclude from the column visibility menu. */
  hideable?: boolean;
};

type DataTableState = {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
  pagination: PaginationState;
  globalFilter: string;
};

const defaultDataTableState = (pageSize = 10): DataTableState => ({
  sorting: [],
  columnFilters: [],
  columnVisibility: {},
  rowSelection: {},
  pagination: { pageIndex: 0, pageSize },
  globalFilter: "",
});

function sortingToCrudSort(sorting: SortingState): CrudSort[] {
  return sorting.map((entry) => ({ id: entry.id, desc: entry.desc }));
}

function getColumnId(column: ColumnDef<unknown, unknown>): string | undefined {
  if (typeof column.id === "string") {
    return column.id;
  }

  if ("accessorKey" in column && typeof column.accessorKey === "string") {
    return column.accessorKey;
  }

  return undefined;
}

function columnFiltersToCrudFilters(
  columnFilters: ColumnFiltersState,
  columns: ColumnDef<unknown, unknown>[],
): CrudFilter[] {
  const metaById = new Map(
    columns
      .map((column) => {
        const id = getColumnId(column);

        return id ? ([id, column.meta as DataTableColumnMeta | undefined] as const) : null;
      })
      .filter((entry): entry is readonly [string, DataTableColumnMeta | undefined] => entry !== null),
  );

  return columnFilters.flatMap((filter) => {
    const meta = metaById.get(filter.id);
    const property = meta?.filter?.property ?? filter.id;
    const operator = meta?.filter?.operator ?? inferOperator(meta?.filter?.type, filter.value);

    if (filter.value === undefined || filter.value === null || filter.value === "") {
      return [];
    }

    return [{ id: property, operator, value: filter.value }];
  });
}

function inferOperator(
  type: DataTableFilterType | undefined,
  value: unknown,
): CrudFilter["operator"] {
  if (type === "multiselect" || (Array.isArray(value) && value.length > 1)) {
    return "in";
  }

  if (type === "boolean") {
    return "eq";
  }

  if (type === "text") {
    return "contains";
  }

  return "eq";
}

/** Converts TanStack Table state into an API Platform query state. */
function dataTableStateToCrudQuery(state: DataTableState, columns: ColumnDef<unknown, unknown>[]): CrudQueryState {
  return {
    page: state.pagination.pageIndex + 1,
    itemsPerPage: state.pagination.pageSize,
    sort: sortingToCrudSort(state.sorting),
    filters: columnFiltersToCrudFilters(state.columnFilters, columns),
    search: state.globalFilter || undefined,
  };
}

/** Visible column ids for the visibility dropdown. */
function getHideableColumns<TData>(columns: ColumnDef<TData, unknown>[]) {
  return columns.flatMap((column) => {
    const id =
      typeof column.id === "string"
        ? column.id
        : "accessorKey" in column && typeof column.accessorKey === "string"
          ? column.accessorKey
          : undefined;
    const meta = column.meta as DataTableColumnMeta | undefined;

    if (!id || meta?.hideable === false || id === "select" || id === "actions") {
      return [];
    }

    return [{ id, label: meta?.label ?? id }];
  });
}

export {
  columnFiltersToCrudFilters,
  dataTableStateToCrudQuery,
  defaultDataTableState,
  getHideableColumns,
  sortingToCrudSort,
  type DataTableColumnMeta,
  type DataTableFilterOption,
  type DataTableFilterType,
  type DataTableState,
};
