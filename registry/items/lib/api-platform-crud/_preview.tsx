"use client";

import { buildApiPlatformQuery } from "./api-platform-crud";

const query = buildApiPlatformQuery({
  page: 2,
  itemsPerPage: 15,
  sort: [
    { id: "title", desc: false },
    { id: "id", desc: true },
  ],
  filters: [
    { id: "status", operator: "in", value: ["published", "draft"] },
    { id: "published", operator: "eq", value: true },
  ],
  search: "foundation",
});

export function Preview() {
  return (
    <pre className="m-0 max-w-2xl overflow-auto rounded-md bg-muted p-3 text-left text-xs">
      {query.toString()}
    </pre>
  );
}
