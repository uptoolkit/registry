"use client";

import { CrudDataTable } from "../../blocks/crud-data-table/crud-data-table";

/**
 * Client half of the CRUD admin page.
 *
 * Swap `endpoint="/api/books"` and `manual` for a live API Platform resource.
 * The preview runs in client mode against local sample rows.
 */
export function CrudAdminPageContent() {
  return (
    <CrudDataTable
      heading="Books"
      searchPlaceholder="Search books..."
      onCreate={() => undefined}
      onEdit={() => undefined}
      onDelete={() => undefined}
      onBulkDelete={() => undefined}
      onQueryChange={() => undefined}
    />
  );
}
