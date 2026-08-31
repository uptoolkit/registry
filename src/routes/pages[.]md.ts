import { createFileRoute } from "@tanstack/react-router";

import { getRegistrySectionMarkdownResponse } from "../lib/registry/markdown.server";

export const Route = createFileRoute("/pages.md")({
  server: {
    handlers: {
      GET: () => getRegistrySectionMarkdownResponse("pages"),
    },
  },
});
