"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SettingsShellSection = {
  id: string;
  label: string;
  description?: string;
  content: React.ReactNode;
};

type SettingsShellProps = {
  sections: readonly SettingsShellSection[];
  /** Controlled active section id. Omit to let the shell manage its own state. */
  activeSection?: string;
  defaultSection?: string;
  onSectionChange?: (id: string) => void;
  title?: string;
  description?: string;
  className?: string;
};

/**
 * Sidebar nav plus content pane for account settings pages.
 *
 * Each section carries its own `content`, so swapping panels means editing
 * the `sections` array instead of branching on the active id yourself.
 * Section state is uncontrolled by default; pass `activeSection` and
 * `onSectionChange` to drive it from a search param instead.
 */
function SettingsShell({
  sections,
  activeSection: controlledSection,
  defaultSection,
  onSectionChange,
  title = "Settings",
  description,
  className,
}: SettingsShellProps) {
  const [uncontrolledSection, setUncontrolledSection] = React.useState(
    defaultSection ?? sections[0]?.id,
  );
  const activeId = controlledSection ?? uncontrolledSection;
  const section = sections.find((entry) => entry.id === activeId) ?? sections[0];

  function selectSection(id: string) {
    if (controlledSection === undefined) {
      setUncontrolledSection(id);
    }

    onSectionChange?.(id);
  }

  return (
    <div className={cn("min-h-svh bg-muted/40", className)}>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-2">
          <h1 className="m-0 text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? <p className="m-0 text-sm text-muted-foreground">{description}</p> : null}
        </header>

        <div className="flex flex-col gap-6 lg:flex-row">
          <nav aria-label="Settings sections" className="w-full shrink-0 lg:w-56">
            <ul className="m-0 flex list-none gap-1 p-0 lg:flex-col">
              {sections.map((entry) => (
                <li key={entry.id} className="flex-1 lg:flex-none">
                  <Button
                    variant={entry.id === activeId ? "secondary" : "ghost"}
                    size="sm"
                    aria-current={entry.id === activeId ? "page" : undefined}
                    className="w-full justify-start"
                    onClick={() => selectSection(entry.id)}
                  >
                    {entry.label}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {section ? (
              <>
                <div className="flex flex-col gap-1">
                  <h2 className="m-0 text-lg font-semibold tracking-tight">{section.label}</h2>
                  {section.description ? (
                    <p className="m-0 text-sm text-muted-foreground">{section.description}</p>
                  ) : null}
                </div>

                {section.content}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export { SettingsShell, type SettingsShellProps, type SettingsShellSection };
