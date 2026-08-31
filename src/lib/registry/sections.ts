import type { RegistryCatalogItem } from "./catalog-builder";
import type { RegistryItemType } from "./item-types.ts";

export type RegistrySectionId = "components" | "blocks" | "layouts" | "pages" | "utilities";

export type RegistryRouteItem = {
  name: string;
  type: RegistryItemType;
  /** Shadcn's free-form tags. A `registry:block` tagged "layout" lives in the Layouts section. */
  categories?: readonly string[];
};

export type RegistrySectionConfig = {
  id: RegistrySectionId;
  title: string;
  description: string;
  basePath: `/${RegistrySectionId}`;
  types: readonly RegistryItemType[];
};

export type RegistrySectionWithItems<T extends RegistryRouteItem = RegistryCatalogItem> =
  RegistrySectionConfig & {
    items: T[];
  };

const componentRegistryTypes = [
  "registry:ui",
  "registry:component",
] as const satisfies readonly RegistryItemType[];

const blockRegistryTypes = ["registry:block"] as const satisfies readonly RegistryItemType[];

/** Layouts are `registry:block` items tagged with this category (see `isLayoutRegistryItem`). */
const layoutRegistryTypes = ["registry:block"] as const satisfies readonly RegistryItemType[];

const pageRegistryTypes = ["registry:page"] as const satisfies readonly RegistryItemType[];

const utilityRegistryTypes = [
  "registry:base",
  "registry:font",
  "registry:lib",
  "registry:hook",
  "registry:file",
  "registry:style",
  "registry:theme",
  "registry:item",
] as const satisfies readonly RegistryItemType[];

export const registrySections = {
  components: {
    id: "components",
    title: "Components",
    description: "Installable UI primitives and components.",
    basePath: "/components",
    types: componentRegistryTypes,
  },
  blocks: {
    id: "blocks",
    title: "Blocks",
    description: "Composed templates and larger UI sections.",
    basePath: "/blocks",
    types: blockRegistryTypes,
  },
  layouts: {
    id: "layouts",
    title: "Layouts",
    description: "Reusable app shells and page layouts you can drop straight into a route.",
    basePath: "/layouts",
    types: layoutRegistryTypes,
  },
  pages: {
    id: "pages",
    title: "Pages",
    description: "Full-page templates you can drop into an app route.",
    basePath: "/pages",
    types: pageRegistryTypes,
  },
  utilities: {
    id: "utilities",
    title: "Utilities",
    description: "Hooks, libraries, files, themes, fonts, bases, styles, and other items.",
    basePath: "/utilities",
    types: utilityRegistryTypes,
  },
} as const satisfies Record<RegistrySectionId, RegistrySectionConfig>;

export const registrySectionList = [
  registrySections.components,
  registrySections.blocks,
  registrySections.layouts,
  registrySections.pages,
  registrySections.utilities,
] as const satisfies readonly RegistrySectionConfig[];

const registrySectionByType = {
  "registry:base": "utilities",
  "registry:block": "blocks",
  "registry:component": "components",
  "registry:font": "utilities",
  "registry:lib": "utilities",
  "registry:hook": "utilities",
  "registry:ui": "components",
  "registry:page": "pages",
  "registry:file": "utilities",
  "registry:style": "utilities",
  "registry:theme": "utilities",
  "registry:item": "utilities",
} as const satisfies Record<RegistryItemType, RegistrySectionId>;

/** The `categories` tag that moves a `registry:block` item into the Layouts section. */
const layoutCategory = "layout";

export function isLayoutRegistryItem(
  item: Pick<RegistryRouteItem, "type" | "categories">,
): boolean {
  return item.type === "registry:block" && (item.categories ?? []).includes(layoutCategory);
}

export function isRegistrySectionId(value: unknown): value is RegistrySectionId {
  return typeof value === "string" && registrySectionList.some((section) => section.id === value);
}

export function getRegistrySection(sectionId: string): RegistrySectionConfig | undefined {
  return isRegistrySectionId(sectionId) ? registrySections[sectionId] : undefined;
}

export function getRegistrySectionIdForType(type: RegistryItemType): RegistrySectionId {
  return registrySectionByType[type];
}

export function getRegistrySectionForType(type: RegistryItemType): RegistrySectionConfig {
  return registrySections[getRegistrySectionIdForType(type)];
}

/**
 * Like `getRegistrySectionIdForType`, but also reads `categories` so a
 * `registry:block` tagged "layout" resolves to the Layouts section instead
 * of Blocks. Prefer this whenever a full item (not a bare type) is on hand.
 */
export function getRegistrySectionIdForItem(
  item: Pick<RegistryRouteItem, "type" | "categories">,
): RegistrySectionId {
  return isLayoutRegistryItem(item) ? "layouts" : getRegistrySectionIdForType(item.type);
}

export function getRegistrySectionForItem(
  item: Pick<RegistryRouteItem, "type" | "categories">,
): RegistrySectionConfig {
  return registrySections[getRegistrySectionIdForItem(item)];
}

export function getRegistryItemRoutePath(item: RegistryRouteItem): string {
  return `${getRegistrySectionForItem(item).basePath}/${item.name}`;
}

export function getRegistrySectionsWithItems<T extends RegistryRouteItem>(
  items: readonly T[],
): RegistrySectionWithItems<T>[] {
  return registrySectionList
    .map((section) => toRegistrySectionWithItems(section, items))
    .filter((section) => section.items.length > 0);
}

export function getRegistrySectionWithItems<T extends RegistryRouteItem>(
  sectionId: string,
  items: readonly T[],
): RegistrySectionWithItems<T> | undefined {
  const section = getRegistrySection(sectionId);

  if (!section) {
    return undefined;
  }

  return toRegistrySectionWithItems(section, items);
}

export function getRegistrySectionItem<T extends RegistryRouteItem>(
  sectionId: string,
  itemName: string,
  items: readonly T[],
): T | undefined {
  const section = getRegistrySection(sectionId);

  if (!section) {
    return undefined;
  }

  return items.find(
    (item) => item.name === itemName && getRegistrySectionIdForItem(item) === section.id,
  );
}

function toRegistrySectionWithItems<T extends RegistryRouteItem>(
  section: RegistrySectionConfig,
  items: readonly T[],
): RegistrySectionWithItems<T> {
  const sectionItems = getRegistryItemsForSection(items, section.id);

  return {
    ...section,
    items: sectionItems,
  };
}

function getRegistryItemsForSection<T extends RegistryRouteItem>(
  items: readonly T[],
  sectionId: RegistrySectionId,
): T[] {
  return items.filter((item) => getRegistrySectionIdForItem(item) === sectionId);
}
