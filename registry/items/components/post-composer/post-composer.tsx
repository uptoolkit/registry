"use client";

import {
  IconAlertTriangle,
  IconAt,
  IconChevronDown,
  IconGlobe,
  IconLock,
  IconMail,
  IconMoodSmile,
  IconPhoto,
  IconUsers,
} from "@tabler/icons-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import {
  createNoteActivity,
  getActorDisplayName,
  type ActivityPubActivity,
  type ActivityPubActor,
  type ActivityPubDocument,
  type ActivityPubObject,
  type ActivityPubTag,
  type ActivityPubVisibility,
} from "../../lib/activitypub/activitypub";
import { ActorAvatar } from "../actor-avatar/actor-avatar";

const visibilityOptions: readonly {
  value: ActivityPubVisibility;
  label: string;
  description: string;
  icon: typeof IconGlobe;
}[] = [
  {
    value: "public",
    label: "Public",
    description: "Visible to everyone and listed in public timelines",
    icon: IconGlobe,
  },
  {
    value: "unlisted",
    label: "Unlisted",
    description: "Visible to everyone but hidden from public timelines",
    icon: IconLock,
  },
  {
    value: "followers",
    label: "Followers",
    description: "Only your followers can see this post",
    icon: IconUsers,
  },
  {
    value: "direct",
    label: "Mentioned only",
    description: "Only the people you mention can see this post",
    icon: IconMail,
  },
];

const mentionPattern = /@([\w.-]+)@([\w.-]+\.[a-z]{2,})/giu;
const hashtagPattern = /(?:^|\s)#([\p{L}\p{N}_]{1,64})/giu;

/** Extracts `Mention` and `Hashtag` tags so the activity carries real tags. */
function extractTags(content: string): ActivityPubTag[] {
  const mentions = Array.from(content.matchAll(mentionPattern), (match) => ({
    type: "Mention" as const,
    name: `@${match[1]}@${match[2]}`,
    href: `https://${match[2]}/users/${match[1]}`,
  }));
  const hashtags = Array.from(content.matchAll(hashtagPattern), (match) => ({
    type: "Hashtag" as const,
    name: `#${match[1]}`,
  }));
  const seen = new Set<string>();

  return [...mentions, ...hashtags].filter((tag) => {
    const key = `${tag.type}:${tag.name.toLowerCase()}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

type PostComposerProps = Omit<React.ComponentProps<typeof Card>, "children" | "onSubmit"> & {
  /** The signed-in actor the post is attributed to. */
  author: ActivityPubActor;
  placeholder?: string;
  defaultVisibility?: ActivityPubVisibility;
  /** Restrict the audience choices, or pass `false` to hide the selector. */
  visibilityOptions?: readonly ActivityPubVisibility[] | false;
  /** Character budget. Mastodon defaults to 500. */
  maxLength?: number;
  /** Reply target. Sets `inReplyTo` on the created object. */
  inReplyTo?: ActivityPubObject | string | null;
  attachments?: readonly ActivityPubDocument[];
  allowContentWarning?: boolean;
  submitLabel?: string;
  /** Receives the `Create` activity to POST to the author's outbox. */
  onSubmit?: (activity: ActivityPubActivity<ActivityPubObject>) => void | Promise<void>;
  onAttach?: () => void;
  /** Keep the typed content after submit. Defaults to clearing it. */
  preserveOnSubmit?: boolean;
};

/**
 * Composer that produces an ActivityPub `Create` activity.
 *
 * Visibility maps to real `to`/`cc` addressing, `@user@host` mentions and
 * `#hashtags` are extracted into `tag`, and a content warning sets `summary`
 * plus `sensitive`.
 */
function PostComposer({
  author,
  placeholder,
  defaultVisibility = "public",
  visibilityOptions: allowedVisibility,
  maxLength = 500,
  inReplyTo,
  attachments,
  allowContentWarning = true,
  submitLabel = "Post",
  onSubmit,
  onAttach,
  preserveOnSubmit = false,
  className,
  ...props
}: PostComposerProps) {
  const [content, setContent] = React.useState("");
  const [visibility, setVisibility] = React.useState<ActivityPubVisibility>(defaultVisibility);
  const [contentWarning, setContentWarning] = React.useState("");
  const [warningOpen, setWarningOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const choices = React.useMemo(() => {
    if (allowedVisibility === false) {
      return [];
    }

    if (!allowedVisibility) {
      return visibilityOptions;
    }

    return visibilityOptions.filter((option) => allowedVisibility.includes(option.value));
  }, [allowedVisibility]);

  const selected = choices.find((option) => option.value === visibility) ?? visibilityOptions[0];
  const remaining = maxLength - Array.from(content).length;
  const canSubmit = content.trim().length > 0 && remaining >= 0 && !pending;
  const replyTargetId = typeof inReplyTo === "string" ? inReplyTo : inReplyTo?.id;

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!canSubmit) {
        return;
      }

      const trimmed = content.trim();
      const warning = warningOpen ? contentWarning.trim() : "";
      const activity = createNoteActivity({
        actor: author,
        content: trimmed,
        visibility,
        tag: extractTags(trimmed),
        ...(warning ? { summary: warning, sensitive: true } : {}),
        ...(replyTargetId ? { inReplyTo: replyTargetId } : {}),
        ...(attachments?.length ? { attachment: attachments } : {}),
      });

      setPending(true);

      try {
        await onSubmit?.(activity);

        if (!preserveOnSubmit) {
          setContent("");
          setContentWarning("");
          setWarningOpen(false);
        }
      } finally {
        setPending(false);
      }
    },
    [
      attachments,
      author,
      canSubmit,
      content,
      contentWarning,
      onSubmit,
      preserveOnSubmit,
      replyTargetId,
      visibility,
      warningOpen,
    ],
  );

  const composerId = React.useId();
  const contentId = `${composerId}-content`;
  const warningId = `${composerId}-warning`;
  const counterId = `${composerId}-counter`;

  return (
    <Card className={cn("w-full", className)} {...props}>
      <form onSubmit={(event) => void handleSubmit(event)}>
        <CardContent className="flex gap-3">
          <ActorAvatar actor={author} size="lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {warningOpen ? (
              <Input
                id={warningId}
                value={contentWarning}
                onChange={(event) => setContentWarning(event.target.value)}
                placeholder="Content warning"
                aria-label="Content warning"
              />
            ) : null}
            <label className="sr-only" htmlFor={contentId}>
              {replyTargetId ? "Write a reply" : "Write a post"}
            </label>
            <Textarea
              id={contentId}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              aria-describedby={counterId}
              aria-invalid={remaining < 0}
              placeholder={
                placeholder ??
                (replyTargetId
                  ? "Write a reply..."
                  : `What's on your mind, ${getActorDisplayName(author).split(" ")[0]}?`)
              }
              className="min-h-24 resize-y border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="flex flex-wrap items-center justify-between gap-2 pt-4">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Add photo or video"
              onClick={onAttach}
            >
              <IconPhoto aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Mention someone"
              onClick={() => setContent((value) => `${value}${value.endsWith(" ") ? "" : " "}@`)}
            >
              <IconAt aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Add emoji"
              onClick={() => setContent((value) => `${value}\u{1F44B}`)}
            >
              <IconMoodSmile aria-hidden="true" />
            </Button>
            {allowContentWarning ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-pressed={warningOpen}
                aria-controls={warningId}
                aria-label="Add content warning"
                className={cn(warningOpen && "text-amber-600 dark:text-amber-400")}
                onClick={() => setWarningOpen((open) => !open)}
              >
                <IconAlertTriangle aria-hidden="true" />
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <span
              id={counterId}
              aria-live="polite"
              className={cn(
                "text-xs tabular-nums",
                remaining < 0 ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {remaining}
            </span>

            {choices.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button type="button" variant="outline" size="sm" />}>
                  <selected.icon aria-hidden="true" />
                  {selected.label}
                  <IconChevronDown aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-w-64">
                  {choices.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setVisibility(option.value)}
                    >
                      <option.icon aria-hidden="true" />
                      <span className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            <Button type="submit" size="sm" disabled={!canSubmit}>
              {submitLabel}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export { PostComposer, extractTags, visibilityOptions, type PostComposerProps };
