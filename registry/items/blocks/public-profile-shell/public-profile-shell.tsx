export type PublicProfileShellProps = {
  title?: string;
  description?: string;
};

export function PublicProfileShell({
  title = "Public Profile Shell",
  description = "Actor profile layout that pairs the profile header with a two-column content slot for signed-out visitors.",
}: PublicProfileShellProps) {
  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
