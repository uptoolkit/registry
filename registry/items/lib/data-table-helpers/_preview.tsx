"use client";

import { defaultDataTableState, dataTableStateToCrudQuery } from "./data-table";

const state = defaultDataTableState(20);
const query = dataTableStateToCrudQuery(state, []);

export function Preview() {
  return (
    <pre className="m-0 max-w-xl overflow-auto rounded-md bg-muted p-3 text-left text-xs">
      {JSON.stringify(query, null, 2)}
    </pre>
  );
}
