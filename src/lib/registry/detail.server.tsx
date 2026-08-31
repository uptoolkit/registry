import { createCompositeComponent, type AnyCompositeComponent } from "@tanstack/react-start/rsc";
import * as React from "react";

import {
  renderMdxContentModule,
  type MdxContentModule,
} from "@/components/docs/mdx-content.server";

import { normalizeGlobFiles } from "../glob";
import { getRegistryItem } from "./catalog";
import type { RegistryItemDetailInput } from "./detail.types";
import { getRegistryDisplaySource } from "./display-source.server";
import { highlightCodeToHtml } from "./highlight.server";
import {
  getRegistryItemWithSources,
  type RegistryCatalogItemWithSources,
  type RegistryPreviewSourceFileWithSource,
  type RegistrySourceFileWithSource,
} from "./source.server";

type RenderedUsage = Awaited<ReturnType<typeof renderUsage>>;
type RenderedPreview = Awaited<ReturnType<typeof renderPreview>>;
type RegistryPreviewModule = React.ComponentType;

const registryUsageModules = import.meta.glob<MdxContentModule>(
  "../../../registry/items/**/_registry.mdx",
);
const registryPreviewModules = import.meta.glob<RegistryPreviewModule>(
  "../../../registry/items/**/_preview.tsx",
  {
    import: "Preview",
  },
);

const registryUsageModulesByPath = normalizeGlobFiles(registryUsageModules);
const registryPreviewModulesByPath = normalizeGlobFiles(registryPreviewModules);

export type HighlightedRegistrySourceFile = RegistrySourceFileWithSource & {
  highlightedHtml: string;
};

export type HighlightedRegistryPreviewSourceFile = RegistryPreviewSourceFileWithSource & {
  highlightedHtml: string;
};

export type RegistryItemDetail = Omit<
  RegistryCatalogItemWithSources,
  "hasUsage" | "previewSourceFile" | "registryMdxFilePath" | "sourceFiles" | "usageSource"
> & {
  preview?: RenderedPreview;
  previewSourceFile: HighlightedRegistryPreviewSourceFile;
  sourceFiles: HighlightedRegistrySourceFile[];
  usage?: RenderedUsage;
};

/**
 * Just the rendered preview, for the standalone viewport route.
 *
 * Skips the syntax highlighting and MDX rendering the docs page needs, since
 * the iframe only ever mounts the component.
 */
export async function getRegistryItemPreviewData(data: RegistryItemDetailInput) {
  const item = getRegistryItem(data.name);

  if (!item?.hasPreview) {
    return { name: data.name, title: item?.title ?? null, preview: null };
  }

  return {
    name: data.name,
    title: item.title,
    preview: await renderPreview(item.previewSourceFile.path),
  };
}

export async function getRegistryItemDetailData(data: RegistryItemDetailInput) {
  const item = getRegistryItem(data.name);

  if (!item) {
    return {
      name: data.name,
      item: null,
    };
  }

  return {
    name: data.name,
    item: await highlightRegistryItem(getRegistryItemWithSources(item)),
  };
}

async function highlightRegistryItem(
  item: RegistryCatalogItemWithSources,
): Promise<RegistryItemDetail> {
  const { hasPreview, hasUsage, usageSource: _usageSource, ...itemWithoutUsageFlag } = item;
  const [preview, previewSourceFile, sourceFiles, usage] = await Promise.all([
    hasPreview ? renderPreview(item.previewSourceFile.path) : null,
    highlightPreviewSourceFile(item, item.previewSourceFile),
    Promise.all(item.sourceFiles.map((file) => highlightSourceFile(item, file))),
    renderUsage(item.registryMdxFilePath, hasUsage),
  ]);

  return {
    ...itemWithoutUsageFlag,
    hasPreview,
    ...(preview ? { preview } : {}),
    previewSourceFile,
    sourceFiles,
    ...(usage ? { usage } : {}),
  };
}

async function highlightPreviewSourceFile(
  item: RegistryCatalogItemWithSources,
  file: RegistryPreviewSourceFileWithSource,
): Promise<HighlightedRegistryPreviewSourceFile> {
  const source = getRegistryDisplaySource(item, file);

  return {
    ...file,
    source,
    highlightedHtml: await highlightCodeToHtml(source, "preview.tsx"),
  };
}

async function highlightSourceFile(
  item: RegistryCatalogItemWithSources,
  file: RegistrySourceFileWithSource,
): Promise<HighlightedRegistrySourceFile> {
  const source = getRegistryDisplaySource(item, file);

  return {
    ...file,
    source,
    highlightedHtml: await highlightCodeToHtml(source, file.path),
  };
}

async function renderUsage(path: string, hasUsage: boolean) {
  if (!hasUsage) {
    return null;
  }

  return renderMdxContentModule(registryUsageModulesByPath[path]);
}

/**
 * Renders the preview module bare.
 *
 * The docs chrome around it lives in `ComponentPreview`, so the standalone
 * `/view/<name>` route can mount the same composite without a frame inside a
 * frame.
 */
async function renderPreview(path: string): Promise<AnyCompositeComponent | null> {
  const loadPreview = registryPreviewModulesByPath[path];

  if (!loadPreview) {
    return null;
  }

  const Preview = await loadPreview();

  return createCompositeComponent(() => <Preview />);
}
