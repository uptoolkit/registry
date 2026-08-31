"use client";

import {
  IconBell,
  IconLogout,
  IconMenu2,
  IconSearch,
  IconSettings,
  IconUser,
  type Icon,
} from "@tabler/icons-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { ActorAvatar } from "../../components/actor-avatar/actor-avatar";
import {
  getActorDisplayName,
  getActorHandle,
  type ActivityPubActor,
} from "../../lib/activitypub/activitypub";
import { sampleViewer } from "../../lib/social-sample-data/social-sample-data";

type AppShellNavItem = {
  label: string;
  href: string;
  icon?: Icon;
  /** Marks the current route. The shell does not do routing itself. */
  active?: boolean;
};

type AppShellProps = {
  /** The signed-in actor, shown in the header avatar and account menu. */
  viewer?: ActivityPubActor;
  brand?: { name: string; href?: string };
  nav?: readonly AppShellNavItem[];
  /** Shows a count badge on the notifications button. */
  notificationsCount?: number;
  onNotificationsClick?: () => void;
  /** Renders a search field in the header and reports submitted queries. */
  onSearch?: (query: string) => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onSignOut?: () => void;
  children?: React.ReactNode;
  className?: string;
};

const defaultNav: readonly AppShellNavItem[] = [
  { label: "Home", href: "#", active: true },
  { label: "Explore", href: "#" },
  { label: "Notifications", href: "#" },
];

/**
 * Primary shell for the signed-in app: sticky header with nav, search,
 * notifications, and an account menu, wrapped around a content slot.
 *
 * The header collapses into a `Sheet` under `md`. Nav items are plain
 * anchors with an `active` flag rather than a router `Link`, so swapping in
 * your router's link component is the only integration step.
 */
function AppShell({
  viewer = sampleViewer,
  brand = { name: "Uptoolkit", href: "#" },
  nav = defaultNav,
  notificationsCount = 0,
  onNotificationsClick,
  onSearch,
  onProfileClick,
  onSettingsClick,
  onSignOut,
  children,
  className,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const displayName = getActorDisplayName(viewer);

  return (
    <div className={cn("min-h-svh bg-muted/40", className)}>
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
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                      item.active
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {item.icon ? <item.icon aria-hidden="true" className="size-4" /> : null}
                    {item.label}
                  </a>
                ))}
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
                  item.active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            {onSearch ? (
              <form
                role="search"
                className="hidden md:block"
                onSubmit={(event) => {
                  event.preventDefault();
                  const data = new FormData(event.currentTarget);
                  const query = data.get("q");
                  onSearch(typeof query === "string" ? query : "");
                }}
              >
                <div className="relative">
                  <IconSearch
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input name="q" placeholder="Search" aria-label="Search" className="w-48 pl-7" />
                </div>
              </form>
            ) : null}

            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              onClick={onNotificationsClick}
              className="relative"
            >
              <IconBell aria-hidden="true" />
              {notificationsCount > 0 ? (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center px-1 text-[10px]">
                  {notificationsCount > 99 ? "99+" : notificationsCount}
                </Badge>
              ) : null}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon" className="rounded-full" />}
              >
                <ActorAvatar actor={viewer} size="sm" />
                <span className="sr-only">Open account menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="min-w-48">
                <DropdownMenuLabel className="flex flex-col gap-0 font-normal">
                  <span className="text-sm font-medium text-foreground">{displayName}</span>
                  <span className="text-xs text-muted-foreground">{getActorHandle(viewer)}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onProfileClick}>
                  <IconUser aria-hidden="true" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSettingsClick}>
                  <IconSettings aria-hidden="true" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={onSignOut}>
                  <IconLogout aria-hidden="true" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}

export { AppShell, type AppShellNavItem, type AppShellProps };
