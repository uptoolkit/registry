import { createFileRoute, notFound } from "@tanstack/react-router";
import { CompositeComponent } from "@tanstack/react-start/rsc";

import { registryNavigationItems } from "../lib/registry/catalog-navigation";
import { getRegistryItemPreview } from "../lib/registry/detail.functions";
import { getRegistrySectionItem } from "../lib/registry/sections";
import { getSeoHead } from "../lib/seo";

/**
 * Standalone viewport for a page preview.
 *
 * The docs page embeds this in a resizable iframe. It has to be a real document
 * rather than a sized `div` because Tailwind breakpoints track the viewport —
 * only an iframe gives the preview a viewport of its own to respond to.
 */
export const Route = createFileRoute("/view/$name")({
  loader: async ({ params }) => {
    // Scoped to the Pages section: these are the only items whose previews are
    // full-page layouts worth viewing at a chosen width.
    if (!getRegistrySectionItem("pages", params.name, registryNavigationItems)) {
      throw notFound();
    }

    const preview = await getRegistryItemPreview({ data: { name: params.name } });

    if (!preview.preview) {
      throw notFound();
    }

    return preview;
  },
  head: ({ loaderData: preview }) =>
    getSeoHead({
      title: preview?.title ?? "Preview",
      description: "Standalone page preview.",
      path: `/view/${preview?.name ?? ""}`,
      noindex: true,
    }),
  component: RegistryItemViewRoute,
});

function RegistryItemViewRoute() {
  const { preview } = Route.useLoaderData();

  return preview ? <CompositeComponent src={preview} /> : null;
}
