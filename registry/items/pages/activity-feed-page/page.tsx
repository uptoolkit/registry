import { ActivityFeedPageContent } from "./activity-feed-page-content";

/**
 * Activity feed page.
 *
 * Composes {@link ActivityFeedShell} around a full {@link ActivityFeed} with
 * filters, date grouping, and a notifications rail. Swap the sample collection
 * for a live `outbox` or `inbox` fetch here and pass the results into
 * `ActivityFeedPageContent`.
 */
export default function Page() {
  return <ActivityFeedPageContent />;
}
