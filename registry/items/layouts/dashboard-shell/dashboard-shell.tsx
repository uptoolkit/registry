"use client";

import {
  IconBell,
  IconCheck,
  IconLanguage,
  IconLayoutSidebar,
  IconLogout,
  IconMenu2,
  IconMessage,
  IconMessageCircle,
  IconPlus,
  IconSearch,
  IconSelector,
  IconSettings,
  IconUser,
  type Icon,
} from "@tabler/icons-react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

type DashboardShellNavItem = {
  label: string;
  href: string;
  icon?: Icon;
  /** Trailing count or short label, e.g. an unread badge on a nav row. */
  badge?: string | number;
  /** Marks the current route. The shell does not do routing itself. */
  active?: boolean;
};

type DashboardShellNavGroup = {
  /** Section heading above the group. Omit for an unlabeled group. */
  label?: string;
  items: readonly DashboardShellNavItem[];
};

type DashboardShellWorkspace = {
  id: string;
  name: string;
  /** Second line under the name, e.g. the plan or workspace kind. */
  meta?: string;
  avatarUrl?: string;
};

type DashboardShellUser = {
  name: string;
  email?: string;
  avatarUrl?: string;
};

type DashboardShellLocale = {
  value: string;
  label: string;
};

type DashboardShellProps = {
  workspace?: DashboardShellWorkspace;
  /** Renders a workspace switcher menu. Omit for a static workspace header. */
  workspaces?: readonly DashboardShellWorkspace[];
  onWorkspaceChange?: (id: string) => void;
  user?: DashboardShellUser;
  nav?: readonly DashboardShellNavGroup[];
  /** Renders a search field in the header and reports submitted queries. */
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  /** Hint rendered inside the search field, e.g. `⌘K`. */
  searchShortcut?: string;
  /** Renders the header's create button. */
  onCreateClick?: () => void;
  messagesCount?: number;
  onMessagesClick?: () => void;
  notificationsCount?: number;
  onNotificationsClick?: () => void;
  /** Current locale value. Pair with `locales` for the header switcher. */
  locale?: string;
  locales?: readonly DashboardShellLocale[];
  onLocaleChange?: (value: string) => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onSignOut?: () => void;
  /** Renders the floating support button in the bottom corner. */
  onSupportClick?: () => void;
  /** Controlled sidebar visibility on `lg` and up. */
  sidebarOpen?: boolean;
  defaultSidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  className?: string;
};

const defaultWorkspace: DashboardShellWorkspace = {
  id: "my-space",
  name: "My Space",
  meta: "Personal",
};

const defaultUser: DashboardShellUser = {
  name: "Alex Moreau",
  email: "alex@example.com",
  avatarUrl: "https://api.dicebear.com/9.x/thumbs/svg?seed=alex-moreau",
};

const defaultNav: readonly DashboardShellNavGroup[] = [
  {
    label: "Explore",
    items: [
      { label: "Dashboard", href: "#dashboard", active: true },
      { label: "Marketplace", href: "#marketplace" },
      { label: "Members", href: "#members" },
    ],
  },
];

function getInitials(name: string) {
  return name
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Shell for a signed-in dashboard: a grouped sidebar with a workspace
 * switcher, a header with search and account actions, and a content slot.
 *
 * The sidebar collapses into a `Sheet` under `lg` and can be toggled away on
 * wider screens. Nav items are plain anchors with an `active` flag rather than
 * a router `Link`, so swapping in your router's link component is the only
 * integration step.
 */
function DashboardShell({
  workspace = defaultWorkspace,
  workspaces,
  onWorkspaceChange,
  user = defaultUser,
  nav = defaultNav,
  onSearch,
  searchPlaceholder = "Search…",
  searchShortcut = "⌘K",
  onCreateClick,
  messagesCount = 0,
  onMessagesClick,
  notificationsCount = 0,
  onNotificationsClick,
  locale,
  locales,
  onLocaleChange,
  onProfileClick,
  onSettingsClick,
  onSignOut,
  onSupportClick,
  sidebarOpen: controlledSidebarOpen,
  defaultSidebarOpen = true,
  onSidebarOpenChange,
  children,
  className,
}: DashboardShellProps) {
  const [uncontrolledSidebarOpen, setUncontrolledSidebarOpen] = React.useState(defaultSidebarOpen);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isSidebarOpen = controlledSidebarOpen ?? uncontrolledSidebarOpen;
  const activeLocale = locales?.find((entry) => entry.value === locale) ?? locales?.[0];

  function toggleSidebar() {
    const next = !isSidebarOpen;

    if (controlledSidebarOpen === undefined) {
      setUncontrolledSidebarOpen(next);
    }

    onSidebarOpenChange?.(next);
  }

  const sidebar = (
    <DashboardSidebar
      workspace={workspace}
      workspaces={workspaces}
      onWorkspaceChange={onWorkspaceChange}
      nav={nav}
      onNavigate={() => setMobileOpen(false)}
    />
  );

  return (
    <div className={cn("flex min-h-svh bg-background", className)}>
      <aside
        aria-label="Sidebar"
        className={cn(
          "sticky top-0 hidden h-svh w-64 shrink-0 border-r",
          isSidebarOpen && "lg:block",
        )}
      >
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex h-14 items-center gap-2 px-4">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" />}>
                <IconMenu2 aria-hidden="true" />
                <span className="sr-only">Open navigation</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                {sidebar}
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              size="icon"
              aria-expanded={isSidebarOpen}
              onClick={toggleSidebar}
              className="hidden lg:inline-flex"
            >
              <IconLayoutSidebar aria-hidden="true" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>

            <div className="ml-auto flex items-center gap-1">
              {onSearch ? (
                <form
                  role="search"
                  className="mr-1 hidden sm:block"
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
                      className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      name="q"
                      placeholder={searchPlaceholder}
                      aria-label="Search"
                      className="h-9 w-56 rounded-xl bg-muted/40 pr-14 pl-8 md:w-72 lg:w-80"
                    />
                    {searchShortcut ? (
                      <kbd
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded-md border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                      >
                        {searchShortcut}
                      </kbd>
                    ) : null}
                  </div>
                </form>
              ) : null}

              {onCreateClick ? (
                <Button variant="ghost" size="icon" aria-label="Create" onClick={onCreateClick}>
                  <IconPlus aria-hidden="true" />
                </Button>
              ) : null}

              {onMessagesClick ? (
                <HeaderCountButton
                  icon={IconMessage}
                  label="Messages"
                  count={messagesCount}
                  onClick={onMessagesClick}
                />
              ) : null}

              <HeaderCountButton
                icon={IconBell}
                label="Notifications"
                count={notificationsCount}
                onClick={onNotificationsClick}
              />

              {locales && locales.length > 0 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
                    <IconLanguage data-icon="inline-start" aria-hidden="true" />
                    {activeLocale?.value.toUpperCase()}
                    <span className="sr-only">Change language</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={8} className="min-w-40">
                    {locales.map((entry) => (
                      <DropdownMenuItem
                        key={entry.value}
                        onClick={() => onLocaleChange?.(entry.value)}
                      >
                        {entry.value === activeLocale?.value ? (
                          <IconCheck aria-hidden="true" />
                        ) : (
                          <span aria-hidden="true" className="size-4" />
                        )}
                        {entry.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon" className="rounded-full" />}
                >
                  <Avatar size="sm">
                    {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Open account menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="min-w-48">
                  <DropdownMenuLabel className="flex flex-col gap-0 font-normal">
                    <span className="text-sm font-medium text-foreground">{user.name}</span>
                    {user.email ? (
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    ) : null}
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

        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>

      {onSupportClick ? (
        <Button
          size="icon-lg"
          aria-label="Support"
          onClick={onSupportClick}
          className="fixed right-6 bottom-6 z-50 size-12 rounded-full shadow-lg"
        >
          <IconMessageCircle aria-hidden="true" className="size-5" />
        </Button>
      ) : null}
    </div>
  );
}

type HeaderCountButtonProps = {
  icon: Icon;
  label: string;
  count: number;
  onClick?: () => void;
};

/** Header icon button with an overlaid unread count. */
function HeaderCountButton({ icon: HeaderIcon, label, count, onClick }: HeaderCountButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={count > 0 ? `${label} (${count} unread)` : label}
      onClick={onClick}
      className="relative"
    >
      <HeaderIcon aria-hidden="true" />
      {count > 0 ? (
        <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 justify-center px-1 text-[10px]">
          {count > 99 ? "99+" : count}
        </Badge>
      ) : null}
    </Button>
  );
}

type DashboardSidebarProps = {
  workspace: DashboardShellWorkspace;
  workspaces?: readonly DashboardShellWorkspace[];
  onWorkspaceChange?: (id: string) => void;
  nav: readonly DashboardShellNavGroup[];
  /** Closes the mobile sheet after a nav item is picked. */
  onNavigate?: () => void;
};

/** Sidebar body, shared by the desktop rail and the mobile sheet. */
function DashboardSidebar({
  workspace,
  workspaces,
  onWorkspaceChange,
  nav,
  onNavigate,
}: DashboardSidebarProps) {
  const workspaceSummary = (
    <>
      <Avatar className="rounded-lg">
        {workspace.avatarUrl ? <AvatarImage src={workspace.avatarUrl} alt="" /> : null}
        <AvatarFallback className="rounded-lg">{getInitials(workspace.name)}</AvatarFallback>
      </Avatar>
      <span className="flex min-w-0 flex-col text-left">
        <span className="truncate text-sm font-semibold">{workspace.name}</span>
        {workspace.meta ? (
          <span className="truncate text-xs text-muted-foreground">{workspace.meta}</span>
        ) : null}
      </span>
    </>
  );

  return (
    <div className="flex h-full flex-col gap-4 pt-3 pb-4">
      <div className="px-3">
        {workspaces && workspaces.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="h-auto w-full justify-start gap-2.5 px-2 py-2 font-normal"
                />
              }
            >
              {workspaceSummary}
              <IconSelector aria-hidden="true" className="ml-auto text-muted-foreground" />
              <span className="sr-only">Switch workspace</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={8} className="min-w-56">
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              {workspaces.map((entry) => (
                <DropdownMenuItem key={entry.id} onClick={() => onWorkspaceChange?.(entry.id)}>
                  {entry.id === workspace.id ? (
                    <IconCheck aria-hidden="true" />
                  ) : (
                    <span aria-hidden="true" className="size-4" />
                  )}
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{entry.name}</span>
                    {entry.meta ? (
                      <span className="truncate text-xs text-muted-foreground">{entry.meta}</span>
                    ) : null}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2.5 px-2 py-2">{workspaceSummary}</div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3">
        {nav.map((group, groupIndex) => (
          <nav
            key={group.label ?? `group-${groupIndex}`}
            aria-label={group.label ?? "Navigation"}
            className="mb-5 last:mb-0"
          >
            {group.label ? (
              <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">{group.label}</p>
            ) : null}
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {group.items.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <a
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={item.active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
                      item.active
                        ? "bg-muted font-medium text-foreground"
                        : "text-foreground/70 hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {item.icon ? (
                      <item.icon
                        aria-hidden="true"
                        className={cn("size-4", !item.active && "text-muted-foreground")}
                      />
                    ) : null}
                    <span className="truncate">{item.label}</span>
                    {item.badge ? (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </div>
  );
}

export {
  DashboardShell,
  type DashboardShellLocale,
  type DashboardShellNavGroup,
  type DashboardShellNavItem,
  type DashboardShellProps,
  type DashboardShellUser,
  type DashboardShellWorkspace,
};
