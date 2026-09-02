"use client";

import { IconBell, IconMenu2, type Icon } from "@tabler/icons-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { ActorAvatar } from "../../components/actor-avatar/actor-avatar";
import {
  getActorDisplayName,
  getActorHandle,
  type ActivityPubActor,
} from "../../lib/activitypub/activitypub";
import { sampleViewer } from "../../lib/social-sample-data/social-sample-data";

type ActivityFeedShellNavItem = {
  label: string;
  href: string;
  icon?: Icon;
  /** Marks the current route. The shell does not do routing itself. */
  active?: boolean;
};

type ActivityFeedShellProps = {
  /** The signed-in actor, shown in the sidebar identity row. */
  viewer?: ActivityPubActor;
  brand?: { name: string; href?: string };
  nav?: readonly ActivityFeedShellNavItem[];
  /** Left sidebar content below navigation. */
  sidebar?: React.ReactNode;
  /** Right rail content — notifications, suggestions, and so on. */
  rail?: React.ReactNode;
  /** Shows a count badge on the mobile notifications affordance. */
  notificationsCount?: number;
  onNotificationsClick?: () => void;
  /** Renders a search field in the mobile header. */
  onSearch?: (query: string) => void;
  children?: React.ReactNode;
  className?: string;
};

const defaultNav: readonly ActivityFeedShellNavItem[] = [
  { label: "Home", href: "#home", active: true },
  { label: "Explore", href: "#explore" },
  { label: "Notifications", href: "#notifications" },
];

/**
 * Three-column shell for activity feed pages.
 *
 * A sticky left sidebar carries the viewer identity and primary navigation, the
 * centre column hosts the feed via `children`, and an optional right rail holds
 * notifications or suggestions. Under `lg` the sidebar collapses into a `Sheet`.
 */
function ActivityFeedShell({
  viewer = sampleViewer,
  brand = { name: "Activity", href: "#" },
  nav = defaultNav,
  sidebar,
  rail,
  notificationsCount = 0,
  onNotificationsClick,
  onSearch,
  children,
  className,
}: ActivityFeedShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className={cn("min-h-svh bg-muted/40", className)}>
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside
          aria-label="Navigation"
          className="sticky top-6 hidden h-fit w-60 shrink-0 flex-col gap-4 lg:flex"
        >
          <a
            href={viewer.url ?? viewer.id}
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent"
          >
            <ActorAvatar actor={viewer} size="lg" presence="online" />
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-semibold">{getActorDisplayName(viewer)}</span>
              <span className="truncate text-xs text-muted-foreground">
                {getActorHandle(viewer)}
              </span>
            </span>
          </a>

          <Separator />

          <nav aria-label="Primary">
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {nav.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <a
                    href={item.href}
                    aria-current={item.active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-2 text-sm font-medium",
                      item.active
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {item.icon ? <item.icon aria-hidden="true" className="size-5" /> : null}
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {sidebar ? (
            <>
              <Separator />
              {sidebar}
            </>
          ) : null}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="flex items-center gap-2 lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" />}>
                <IconMenu2 aria-hidden="true" />
                <span className="sr-only">Open navigation</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex flex-col gap-4 p-4 pt-12">
                  <a
                    href={brand.href ?? "#"}
                    className="font-semibold tracking-tight"
                    onClick={() => setMobileOpen(false)}
                  >
                    {brand.name}
                  </a>
                  <nav aria-label="Primary">
                    <ul className="m-0 flex list-none flex-col gap-1 p-0">
                      {nav.map((item) => (
                        <li key={`mobile-${item.href}-${item.label}`}>
                          <a
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            aria-current={item.active ? "page" : undefined}
                            className={cn(
                              "flex items-center gap-3 rounded-lg p-2 text-sm font-medium",
                              item.active
                                ? "bg-secondary text-secondary-foreground"
                                : "text-muted-foreground hover:bg-accent",
                            )}
                          >
                            {item.icon ? <item.icon aria-hidden="true" className="size-5" /> : null}
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  {sidebar}
                </div>
              </SheetContent>
            </Sheet>

            <a href={brand.href ?? "#"} className="font-semibold tracking-tight">
              {brand.name}
            </a>

            <div className="ml-auto flex items-center gap-1">
              {onSearch ? (
                <form
                  role="search"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const data = new FormData(event.currentTarget);
                    const query = data.get("q");
                    onSearch(typeof query === "string" ? query : "");
                  }}
                >
                  <Input name="q" placeholder="Search" aria-label="Search" className="h-8 w-36" />
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
            </div>
          </header>

          <main className="flex min-w-0 flex-1 justify-center">{children}</main>
        </div>

        {rail ? (
          <aside
            aria-label="Secondary"
            className="sticky top-6 hidden h-fit w-80 shrink-0 flex-col gap-4 xl:flex"
          >
            {rail}
          </aside>
        ) : null}
      </div>
    </div>
  );
}

export { ActivityFeedShell, type ActivityFeedShellNavItem, type ActivityFeedShellProps };
