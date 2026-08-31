export type SettingsShellProps = {
  title?: string;
  description?: string;
};

export function SettingsShell({
  title = "Settings Shell",
  description = "Sidebar section nav and content pane shell for account settings pages.",
}: SettingsShellProps) {
  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
