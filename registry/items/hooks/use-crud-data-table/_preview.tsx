"use client";

import { createBookColumns, sampleBooks } from "../../blocks/crud-data-table/crud-sample-data";
import { useCrudDataTable } from "./use-crud-data-table";

export function Preview() {
  const { table, query } = useCrudDataTable({
    columns: createBookColumns(),
    data: sampleBooks,
    pageSize: 5,
  });

  return (
    <div className="flex w-full max-w-md flex-col gap-2 text-left text-sm">
      <p className="m-0 text-muted-foreground">{table.getRowModel().rows.length} visible rows</p>
      <pre className="m-0 overflow-auto rounded-md bg-muted p-3 text-xs">
        {JSON.stringify(query, null, 2)}
      </pre>
    </div>
  );
}
