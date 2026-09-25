"use client";

import { CrudDataTable } from "./crud-data-table";

export function Preview() {
  return (
    <CrudDataTable
      heading="Books"
      onCreate={() => undefined}
      onEdit={() => undefined}
      onDelete={() => undefined}
      onBulkDelete={() => undefined}
    />
  );
}
