"use client";

import { PublicShell } from "./public-shell";

export function Preview() {
  return (
    <PublicShell
      nav={[
        { label: "Product", href: "#", active: true },
        { label: "Pricing", href: "#" },
        { label: "Docs", href: "#" },
      ]}
      footerSections={[
        {
          heading: "Product",
          links: [
            { label: "Overview", href: "#" },
            { label: "Pricing", href: "#" },
          ],
        },
        {
          heading: "Company",
          links: [
            { label: "About", href: "#" },
            { label: "Blog", href: "#" },
          ],
        },
      ]}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 px-4 py-16">
        <h1 className="m-0 text-3xl font-semibold tracking-tight">Page content goes here</h1>
        <p className="m-0 max-w-prose text-muted-foreground">
          Marketing and landing page content renders in the shell&apos;s content slot.
        </p>
      </div>
    </PublicShell>
  );
}
