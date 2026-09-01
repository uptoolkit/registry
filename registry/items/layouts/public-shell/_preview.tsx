"use client";

import { PublicShell } from "./public-shell";

export function Preview() {
  return (
    <PublicShell
      nav={[
        { label: "Product", href: "#product", active: true },
        { label: "Pricing", href: "#pricing" },
        { label: "Docs", href: "#docs" },
      ]}
      footerSections={[
        {
          heading: "Product",
          links: [
            { label: "Overview", href: "#overview" },
            { label: "Pricing", href: "#pricing" },
          ],
        },
        {
          heading: "Company",
          links: [
            { label: "About", href: "#about" },
            { label: "Blog", href: "#blog" },
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
