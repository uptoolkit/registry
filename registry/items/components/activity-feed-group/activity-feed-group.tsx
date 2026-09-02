import * as React from "react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type ActivityFeedGroupProps = Omit<React.ComponentProps<"section">, "children"> & {
  /** Human-readable heading, for example "Today" or "March 2025". */
  label: string;
  children: React.ReactNode;
};

/**
 * Date-grouped section for an activity feed.
 *
 * Renders a muted uppercase heading with a trailing rule, then the entry list
 * passed as `children`. Pair with {@link ActivityFeedItem} inside an `<ol>`.
 */
function ActivityFeedGroup({ label, children, className, ...props }: ActivityFeedGroupProps) {
  return (
    <section aria-label={label} className={cn("flex flex-col gap-3", className)} {...props}>
      <div className="flex items-center gap-3">
        <h3 className="m-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </h3>
        <Separator className="flex-1" />
      </div>
      {children}
    </section>
  );
}

export { ActivityFeedGroup, type ActivityFeedGroupProps };
