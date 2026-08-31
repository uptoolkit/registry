import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ActorGrid } from "../../blocks/actor-grid/actor-grid";
import { ProfileHeader } from "../../blocks/profile-header/profile-header";
import { SocialFeed } from "../../blocks/social-feed/social-feed";
import { ActorAvatarGroup } from "../../components/actor-avatar/actor-avatar";
import { JsonLd } from "../../components/json-ld/json-ld";
import { toProfilePageJsonLd } from "../../lib/schema-org/schema-org";
import {
  SAMPLE_NOW,
  buildCreateActivity,
  sampleAuthor,
  sampleCounts,
  sampleFollowers,
  sampleTimeline,
  sampleViewer,
} from "../../lib/social-sample-data/social-sample-data";

/**
 * Actor profile page.
 *
 * The header, timeline, and followers grid all read the same `ActivityPubActor`,
 * and the page emits one Schema.org `ProfilePage` node whose `mainEntity` is the
 * actor and whose `hasPart` lists the visible posts. Replace the sample
 * fixtures with a WebFinger lookup plus an `outbox` fetch.
 */
export default function Page() {
  const actor = sampleAuthor;
  const posts = sampleTimeline.filter(
    (post) => typeof post.attributedTo !== "string" && post.attributedTo.id === actor.id,
  );
  const timeline = posts.map((post) => buildCreateActivity(post));
  const mutuals = sampleFollowers.filter((follower) => follower.id !== actor.id);

  return (
    <div className="min-h-svh bg-muted/40">
      <JsonLd data={toProfilePageJsonLd(actor, { counts: sampleCounts.author, posts })} />

      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
        <ProfileHeader
          actor={actor}
          viewer={sampleViewer}
          counts={sampleCounts.author}
          includeJsonLd={false}
          tabs={[
            { value: "posts", label: "Posts", count: sampleCounts.author.posts },
            { value: "followers", label: "Followers", count: sampleCounts.author.followers },
            { value: "about", label: "About" },
          ]}
        />

        <div className="flex flex-col gap-6 lg:flex-row">
          <main className="min-w-0 flex-1">
            <SocialFeed
              viewer={sampleViewer}
              collection={timeline}
              heading={`Posts by ${actor.name}`}
              hideComposer
              showComments
              now={SAMPLE_NOW}
              className="max-w-none"
            />
          </main>

          <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-80">
            <Card className="gap-3 py-4">
              <CardHeader>
                <CardTitle className="text-base">Mutual contacts</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <ActorAvatarGroup actors={mutuals} total={sampleCounts.author.followers} max={5} />
                <p className="m-0 text-sm text-muted-foreground">
                  {mutuals.length} people you follow also follow {actor.name}.
                </p>
              </CardContent>
            </Card>

            <ActorGrid
              actors={mutuals}
              heading="Followers"
              variant="row"
              columns={1}
              initialCount={4}
              searchable
              includeJsonLd={false}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
