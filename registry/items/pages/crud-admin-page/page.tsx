import { CrudAdminPageContent } from "./crud-admin-content";

/**
 * CRUD admin page with a full API Platform-ready data table.
 *
 * Replace the sample rows by passing `endpoint` and enabling server mode on
 * `CrudDataTable` inside `CrudAdminPageContent`.
 */
export default function Page() {
  return (
    <div className="min-h-svh bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <CrudAdminPageContent />
      </div>
    </div>
  );
}
