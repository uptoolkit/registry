"use client";

import { IconMenu2 } from "@tabler/icons-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type PublicShellNavItem = {
  label: string;
  href: string;
  /** Marks the current route. The shell does not do routing itself. */
  active?: boolean;
};

type PublicShellFooterSection = {
  heading: string;
  links: readonly { label: string; href: string }[];
};

type PublicShellProps = {
  brand?: { name: string; href?: string };
  nav?: readonly PublicShellNavItem[];
  signInHref?: string;
  signUpHref?: string;
  /** Link columns rendered above the footer note. Omit to skip the grid. */
  footerSections?: readonly PublicShellFooterSection[];
  /** Rendered at the bottom of the footer. Defaults to a rights line. */
  footerNote?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

const defaultNav: readonly PublicShellNavItem[] = [
  { label: "Product", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Docs", href: "#" },
];

/**
 * Shell for signed-out marketing pages: a header with nav and sign-in/sign-up
 * links, a `children` content slot, and a link-column footer.
 *
 * Nav items and footer links are plain anchors, not a router `Link` — swap
 * them for your router's link component if you need client-side navigation.
 */
function PublicShell({
  brand = { name: "Uptoolkit", href: "#" },
  nav = defaultNav,
  signInHref = "#",
  signUpHref = "#",
  footerSections,
  footerNote,
  children,
  className,
}: PublicShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className={cn("flex min-h-svh flex-col", className)}>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
              <IconMenu2 aria-hidden="true" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <nav aria-label="Primary" className="flex flex-col gap-1 p-4 pt-12">
                {nav.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={item.active ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium",
                      item.active
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </a>
                ))}
                <div className="mt-2 flex flex-col gap-2 border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<a href={signInHref} />}
                  >
                    Sign in
                  </Button>
                  <Button size="sm" nativeButton={false} render={<a href={signUpHref} />}>
                    Get started
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <a
            href={brand.href ?? "#"}
            className="flex shrink-0 items-center gap-2 font-semibold tracking-tight"
          >
            {brand.name}
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  item.active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" nativeButton={false} render={<a href={signInHref} />}>
              Sign in
            </Button>
            <Button size="sm" nativeButton={false} render={<a href={signUpHref} />}>
              Get started
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
          {footerSections && footerSections.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {footerSections.map((section) => (
                <div key={section.heading} className="flex flex-col gap-2">
                  <span className="text-sm font-medium">{section.heading}</span>
                  <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-foreground"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}

          <p className="m-0 text-sm text-muted-foreground">
            {footerNote ?? `${brand.name}. All rights reserved.`}
          </p>
        </div>
      </footer>
    </div>
  );
}

export {
  PublicShell,
  type PublicShellFooterSection,
  type PublicShellNavItem,
  type PublicShellProps,
};
