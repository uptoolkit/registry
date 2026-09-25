/**
 * Sample rows and column definitions for the CRUD data table previews.
 */

import { IconDots, IconPencil, IconTrash } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { DataTableColumnMeta } from "../../lib/data-table-helpers/data-table";
import { DataTableColumnHeader } from "../../components/data-table/data-table-column-header";
import { getApiPlatformItemId } from "../../lib/api-platform-crud/api-platform-crud";

type BookStatus = "draft" | "published" | "archived";

type Book = {
  "@id": string;
  id: number;
  title: string;
  author: string;
  status: BookStatus;
  published: boolean;
  updatedAt: string;
};

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
] as const;

const sampleBooks: Book[] = [
  {
    "@id": "/books/1",
    id: 1,
    title: "The Left Hand of Darkness",
    author: "Ursula K. Le Guin",
    status: "published",
    published: true,
    updatedAt: "2025-05-12T10:00:00.000Z",
  },
  {
    "@id": "/books/2",
    id: 2,
    title: "Dune",
    author: "Frank Herbert",
    status: "published",
    published: true,
    updatedAt: "2025-05-10T08:30:00.000Z",
  },
  {
    "@id": "/books/3",
    id: 3,
    title: "The Dispossessed",
    author: "Ursula K. Le Guin",
    status: "draft",
    published: false,
    updatedAt: "2025-04-28T16:45:00.000Z",
  },
  {
    "@id": "/books/4",
    id: 4,
    title: "Neuromancer",
    author: "William Gibson",
    status: "published",
    published: true,
    updatedAt: "2025-04-20T12:15:00.000Z",
  },
  {
    "@id": "/books/5",
    id: 5,
    title: "The Three-Body Problem",
    author: "Liu Cixin",
    status: "archived",
    published: false,
    updatedAt: "2025-03-18T09:00:00.000Z",
  },
  {
    "@id": "/books/6",
    id: 6,
    title: "Foundation",
    author: "Isaac Asimov",
    status: "published",
    published: true,
    updatedAt: "2025-03-01T11:20:00.000Z",
  },
  {
    "@id": "/books/7",
    id: 7,
    title: "Snow Crash",
    author: "Neal Stephenson",
    status: "draft",
    published: false,
    updatedAt: "2025-02-14T14:10:00.000Z",
  },
  {
    "@id": "/books/8",
    id: 8,
    title: "The Broken Earth",
    author: "N.K. Jemisin",
    status: "published",
    published: true,
    updatedAt: "2025-01-30T18:00:00.000Z",
  },
];

function formatBookDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function createBookColumns(options?: {
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
}): ColumnDef<Book, unknown>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
      meta: {
        label: "Title",
        filter: { type: "text", placeholder: "Filter title...", operator: "contains" },
      } satisfies DataTableColumnMeta,
    },
    {
      accessorKey: "author",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Author" />,
      meta: {
        label: "Author",
        filter: { type: "text", placeholder: "Filter author...", operator: "contains" },
      } satisfies DataTableColumnMeta,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue<BookStatus>("status");

        return <Badge variant="outline">{status}</Badge>;
      },
      meta: {
        label: "Status",
        filter: {
          type: "multiselect",
          operator: "in",
          options: statusOptions.map((option) => ({ ...option })),
        },
      } satisfies DataTableColumnMeta,
    },
    {
      accessorKey: "published",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Published" />,
      cell: ({ row }) => (row.getValue<boolean>("published") ? "Yes" : "No"),
      meta: {
        label: "Published",
        filter: { type: "boolean", operator: "eq" },
      } satisfies DataTableColumnMeta,
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
      cell: ({ row }) => formatBookDate(row.getValue<string>("updatedAt")),
      meta: { label: "Updated" } satisfies DataTableColumnMeta,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
            <IconDots aria-hidden="true" />
            <span className="sr-only">Open row actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => options?.onEdit?.(row.original)}>
              <IconPencil aria-hidden="true" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => options?.onDelete?.(row.original)}>
              <IconTrash aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

export {
  createBookColumns,
  formatBookDate,
  getApiPlatformItemId,
  sampleBooks,
  statusOptions,
  type Book,
  type BookStatus,
};
