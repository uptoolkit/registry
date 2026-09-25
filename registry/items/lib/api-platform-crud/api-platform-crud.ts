/**
 * Helpers for API Platform collection endpoints.
 *
 * Parses Hydra/JSON-LD collections and builds query strings compatible with
 * API Platform's default pagination, order, search, and filter parameters.
 *
 * @see https://api-platform.com/docs/core/pagination/
 * @see https://api-platform.com/docs/core/filters/
 */

const HYDRA_MEMBER = "hydra:member";
const HYDRA_TOTAL = "hydra:totalItems";
const HYDRA_VIEW = "hydra:view";
const HYDRA_FIRST = "hydra:first";
const HYDRA_LAST = "hydra:last";
const HYDRA_NEXT = "hydra:next";
const HYDRA_PREVIOUS = "hydra:previous";

type ApiPlatformView = {
  first?: string;
  last?: string;
  next?: string;
  previous?: string;
};

type ApiPlatformCollection<T> = {
  member: T[];
  totalItems: number;
  view?: ApiPlatformView;
};

type CrudSort = {
  id: string;
  desc: boolean;
};

type CrudFilterOperator =
  | "eq"
  | "contains"
  | "in"
  | "exists"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "search";

type CrudFilter = {
  id: string;
  operator?: CrudFilterOperator;
  value: unknown;
};

type CrudQueryState = {
  page: number;
  itemsPerPage: number;
  sort: readonly CrudSort[];
  filters: readonly CrudFilter[];
  search?: string;
};

type ApiPlatformCrudConfig = {
  /** Page query parameter. Default `page`. */
  pageParam?: string;
  /** Items per page parameter. Default `itemsPerPage`. */
  itemsPerPageParam?: string;
  /** Order prefix. Default `order` (`order[field]=asc`). */
  orderParam?: string;
  /** Global search parameter. Default `search`. */
  searchParam?: string;
  /** Collection member key override. Auto-detects Hydra by default. */
  memberKey?: string;
  /** Total items key override. Auto-detects Hydra by default. */
  totalItemsKey?: string;
};

const defaultConfig: Required<
  Pick<
    ApiPlatformCrudConfig,
    "pageParam" | "itemsPerPageParam" | "orderParam" | "searchParam"
  >
> = {
  pageParam: "page",
  itemsPerPageParam: "itemsPerPage",
  orderParam: "order",
  searchParam: "search",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];

  return typeof value === "string" ? value : undefined;
}

function readNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];

  return typeof value === "number" ? value : undefined;
}

/** Normalises an API Platform collection payload into a stable shape. */
function parseApiPlatformCollection<T>(
  payload: unknown,
  config: ApiPlatformCrudConfig = {},
): ApiPlatformCollection<T> {
  if (!isRecord(payload)) {
    return { member: [], totalItems: 0 };
  }

  const memberKey = config.memberKey ?? (HYDRA_MEMBER in payload ? HYDRA_MEMBER : "member");
  const totalKey =
    config.totalItemsKey ?? (HYDRA_TOTAL in payload ? HYDRA_TOTAL : "totalItems");
  const viewKey = HYDRA_VIEW in payload ? HYDRA_VIEW : "view";

  const rawMember = payload[memberKey];
  const member = Array.isArray(rawMember) ? (rawMember as T[]) : [];
  const totalItems = readNumber(payload, totalKey) ?? member.length;
  const rawView = payload[viewKey];

  if (!isRecord(rawView)) {
    return { member, totalItems };
  }

  return {
    member,
    totalItems,
    view: {
      first: readString(rawView, HYDRA_FIRST) ?? readString(rawView, "first"),
      last: readString(rawView, HYDRA_LAST) ?? readString(rawView, "last"),
      next: readString(rawView, HYDRA_NEXT) ?? readString(rawView, "next"),
      previous: readString(rawView, HYDRA_PREVIOUS) ?? readString(rawView, "previous"),
    },
  };
}

/** Reads `@id` or `id` from a resource item. */
function getApiPlatformItemId(item: Record<string, unknown>): string {
  const atId = item["@id"];

  if (typeof atId === "string") {
    return atId;
  }

  const id = item.id;

  if (typeof id === "string" || typeof id === "number") {
    return String(id);
  }

  return "";
}

function appendFilter(params: URLSearchParams, filter: CrudFilter): void {
  const { id, operator = "eq", value } = filter;

  if (value === undefined || value === null || value === "") {
    return;
  }

  switch (operator) {
    case "search":
      return;
    case "exists":
      params.set(`exists[${id}]`, value === true ? "true" : "false");
      return;
    case "in":
      if (Array.isArray(value)) {
        for (const entry of value) {
          params.append(`${id}[]`, String(entry));
        }
      }
      return;
    case "contains":
      params.set(id, String(value));
      return;
    case "gt":
      params.set(`${id}[gt]`, String(value));
      return;
    case "gte":
      params.set(`${id}[gte]`, String(value));
      return;
    case "lt":
      params.set(`${id}[lt]`, String(value));
      return;
    case "lte":
      params.set(`${id}[lte]`, String(value));
      return;
    case "between":
      if (Array.isArray(value) && value.length === 2) {
        params.set(`${id}[after]`, String(value[0]));
        params.set(`${id}[before]`, String(value[1]));
      }
      return;
    case "eq":
    default:
      if (typeof value === "boolean") {
        params.set(id, value ? "true" : "false");
        return;
      }

      params.set(id, String(value));
  }
}

/** Builds API Platform query parameters from table state. */
function buildApiPlatformQuery(
  state: CrudQueryState,
  config: ApiPlatformCrudConfig = {},
): URLSearchParams {
  const merged = { ...defaultConfig, ...config };
  const params = new URLSearchParams();

  params.set(merged.pageParam, String(Math.max(1, state.page)));
  params.set(merged.itemsPerPageParam, String(Math.max(1, state.itemsPerPage)));

  for (const sort of state.sort) {
    params.set(`${merged.orderParam}[${sort.id}]`, sort.desc ? "desc" : "asc");
  }

  if (state.search?.trim()) {
    params.set(merged.searchParam, state.search.trim());
  }

  for (const filter of state.filters) {
    appendFilter(params, filter);
  }

  return params;
}

/** Appends query parameters to a collection endpoint URL. */
function withApiPlatformQuery(
  endpoint: string,
  state: CrudQueryState,
  config?: ApiPlatformCrudConfig,
): string {
  const url = new URL(endpoint, "http://localhost");
  const params = buildApiPlatformQuery(state, config);

  params.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  return `${url.pathname}${url.search}`;
}

/** Fetches one API Platform collection page. */
async function fetchApiPlatformCollection<T>(
  endpoint: string,
  state: CrudQueryState,
  init?: RequestInit,
  config?: ApiPlatformCrudConfig,
): Promise<ApiPlatformCollection<T>> {
  const url = withApiPlatformQuery(endpoint, state, config);
  const response = await fetch(url, {
    headers: {
      Accept: "application/ld+json, application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`API Platform request failed (${response.status})`);
  }

  const payload: unknown = await response.json();

  return parseApiPlatformCollection<T>(payload, config);
}

/** Derives page count from total items and page size. */
function getApiPlatformPageCount(totalItems: number, itemsPerPage: number): number {
  return Math.max(1, Math.ceil(totalItems / Math.max(1, itemsPerPage)));
}

export {
  buildApiPlatformQuery,
  fetchApiPlatformCollection,
  getApiPlatformItemId,
  getApiPlatformPageCount,
  parseApiPlatformCollection,
  withApiPlatformQuery,
  type ApiPlatformCollection,
  type ApiPlatformCrudConfig,
  type ApiPlatformView,
  type CrudFilter,
  type CrudFilterOperator,
  type CrudQueryState,
  type CrudSort,
};
