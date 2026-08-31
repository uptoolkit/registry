import { IconCake, IconMapPin, IconPhoto } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { ActorGrid } from "../../blocks/actor-grid/actor-grid";
import { ProfileHeader } from "../../blocks/profile-header/profile-header";
import { sampleWallCollection, toWallEntries } from "../../blocks/wall-feed/wall-activities";
import { WallFeed } from "../../blocks/wall-feed/wall-feed";
import { ActorAvatarGroup } from "../../components/actor-avatar/actor-avatar";
import { JsonLd } from "../../components/json-ld/json-ld";
import {
  formatCompactNumber,
  getActorDisplayName,
  getCollectionItems,
  toPlainText,
} from "../../lib/activitypub/activitypub";
import { toProfilePageJsonLd } from "../../lib/schema-org/schema-org";
import {
  SAMPLE_NOW,
  sampleAuthor,
  sampleCounts,
  sampleFollowers,
  sampleViewer,
} from "../../lib/social-sample-data/social-sample-data";

/**
 * Profile wall page.
 *
 * The header, the activity feed, and the rails all read the same
 * `ActivityPubActor`, and the page emits one Schema.org `ProfilePage` whose
 * `hasPart` lists the visible posts. Replace the fixtures with a WebFinger
 * lookup plus an `outbox` fetch.
 */
export default function Page() {
  const owner = sampleAuthor;
  const viewer = sampleViewer;
  const counts = sampleCounts.author;
  const friends = sampleFollowers.filter((actor) => actor.id !== owner.id);
  const entries = toWallEntries(getCollectionItems(sampleWallCollection), owner);

  // The rail derives its thumbnails from the wall's own attachments, so the two
  // can never disagree about what has been posted. Reaction entries point at a
  // post that is already in the stream, so the same image arrives more than
  // once — dedupe by URL rather than showing it twice in the grid.
  const photos = [
    ...new Map(
      entries
        .flatMap((entry) => entry.object?.attachment ?? [])
        .filter((file) => file.type === "Image")
        .map((file) => [file.url, file]),
    ).values(),
  ];

  const posts = entries.flatMap((entry) =>
    entry.kind === "post" && entry.object ? [entry.object] : [],
  );

  return (
    <div className="min-h-svh bg-muted/40">
      <JsonLd data={toProfilePageJsonLd(owner, { counts, posts })} />

      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
        <ProfileHeader
          actor={owner}
          viewer={viewer}
          counts={counts}
          includeJsonLd={false}
          tabs={[]}
        />

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="flex w-full shrink-0 flex-col gap-4 lg:order-first lg:w-72">
            <IntroCard owner={owner} counts={counts} />
            <PhotosCard photos={photos} />
            <FriendsCard friends={friends} total={counts.followers} />
          </aside>

          <main className="min-w-0 flex-1">
            <WallFeed
              owner={owner}
              viewer={viewer}
              collection={sampleWallCollection}
              showComments
              now={SAMPLE_NOW}
              className="max-w-none"
            />
          </main>
        </div>
      </div>
    </div>
  );
}

function IntroCard({
  owner,
  counts,
}: {
  owner: typeof sampleAuthor;
  counts: { posts: number; followers: number; following: number };
}) {
  const fields = owner.attachment ?? [];

  return (
    <Card className="gap-3 py-4">
      <CardHeader>
        <CardTitle className="text-base">Intro</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="m-0 text-sm text-muted-foreground">{toPlainText(owner.summary)}</p>

        <Separator />

        <dl className="m-0 flex flex-col gap-2 text-sm">
          {fields.map((field) => (
            <div key={field.name} className="flex items-center gap-2">
              <IconMapPin aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
              <dt className="sr-only">{field.name}</dt>
              <dd className="m-0 truncate">{field.value}</dd>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <IconCake aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            <dt className="sr-only">Posts</dt>
            <dd className="m-0">{formatCompactNumber(counts.posts)} posts</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

function PhotosCard({ photos }: { photos: readonly { url: string; name?: string | null }[] }) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <IconPhoto aria-hidden="true" className="size-4" />
          Photos
        </CardTitle>
        <Button variant="ghost" size="xs">
          See all
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="m-0 grid list-none grid-cols-3 gap-1.5 p-0">
          {photos.slice(0, 9).map((photo) => (
            <li key={photo.url} className="overflow-hidden rounded-md border">
              <img
                src={photo.url}
                alt={photo.name ?? ""}
                loading="lazy"
                className="aspect-square size-full object-cover"
              />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function FriendsCard({
  friends,
  total,
}: {
  friends: readonly (typeof sampleFollowers)[number][];
  total: number;
}) {
  return (
    <>
      <Card className="gap-3 py-4">
        <CardHeader>
          <CardTitle className="text-base">Friends</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <ActorAvatarGroup actors={friends} total={total} max={5} />
          <p className="m-0 text-sm text-muted-foreground">
            {formatCompactNumber(total)} people follow {getActorDisplayName(friends[0])} and{" "}
            {friends.length - 1} others you know.
          </p>
        </CardContent>
      </Card>

      <ActorGrid
        actors={friends}
        heading="People you may know"
        variant="row"
        columns={1}
        initialCount={4}
        includeJsonLd={false}
      />
    </>
  );
}
