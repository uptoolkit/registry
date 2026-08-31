import {
  IconBlocks,
  IconBrandGithub,
  IconCode,
  IconComponents,
  IconDownload,
  IconFileText,
  IconLayoutGrid,
  IconTool,
} from "@tabler/icons-react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { InstallCommand } from "@/components/docs/install-command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getSeoHead } from "../lib/seo";
import { registrySectionList, type RegistrySectionId } from "../lib/registry/sections";
import { siteConfig } from "../lib/site-config";

export const Route = createFileRoute("/")({
  head: () =>
    getSeoHead({
      title: siteConfig.name,
      description: siteConfig.description,
      path: "/",
    }),
  component: HomePage,
});

const sectionIcons: Record<RegistrySectionId, typeof IconComponents> = {
  components: IconComponents,
  blocks: IconLayoutGrid,
  pages: IconFileText,
  utilities: IconTool,
};

const steps = [
  {
    title: "Browse the catalog",
    description:
      "Explore components, blocks, pages, and utilities, each with a live preview and the full source shown right on the page.",
    icon: IconLayoutGrid,
  },
  {
    title: "Copy one command",
    description:
      "Every item ships an install command for npm, pnpm, yarn, bun, deno, and Vite+ — no manual file copying required.",
    icon: IconDownload,
  },
  {
    title: "Own the code",
    description:
      "The CLI writes the source straight into your project, so you can read it, restyle it, and extend it like anything else you wrote.",
    icon: IconCode,
  },
] as const;

function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="flex flex-col items-center gap-6 px-4 py-24 text-center sm:py-32">
        <Badge variant="secondary">Shadcn-compatible registry</Badge>
        <h1 className="font-mono text-2xl font-bold tracking-tighter sm:text-4xl">
          {siteConfig.name}
        </h1>
        <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
          {siteConfig.description}
        </p>
        <p className="max-w-xl text-sm text-balance text-muted-foreground">
          Instead of installing a black-box package, you pull real source files into your own
          project with the <code className="font-mono text-foreground">shadcn</code> CLI. There's
          no version to fall behind on and no bundle you can't inspect — once an item is installed
          it's just your code.
        </p>
        <div className="flex items-center gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link to="/$section" params={{ section: "components" }} />}
          >
            <IconBlocks data-icon="inline-start" />
            Browse
          </Button>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<a href={siteConfig.repositoryUrl} target="_blank" rel="noopener noreferrer" />}
          >
            <IconBrandGithub data-icon="inline-start" />
            GitHub
          </Button>
        </div>
        <InstallCommand item={{ name: "example-card" }} className="mt-2 w-full max-w-lg" />
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <h2 className="font-heading text-xl font-semibold sm:text-2xl">What's in the registry</h2>
          <p className="max-w-lg text-sm text-muted-foreground">
            Items are grouped by how much of your app they cover, from single primitives to
            entire routes.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {registrySectionList.map((section) => {
            const SectionIcon = sectionIcons[section.id];

            return (
              <Link
                key={section.id}
                to="/$section"
                params={{ section: section.id }}
                className="group flex flex-col gap-2 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted/50"
              >
                <SectionIcon
                  data-icon
                  className="size-5 text-muted-foreground transition-colors group-hover:text-foreground"
                />
                <span className="font-heading text-sm font-medium">{section.title}</span>
                <span className="text-sm text-muted-foreground">{section.description}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-16 sm:grid-cols-3 sm:px-6 lg:px-8">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col items-start gap-2">
              <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <step.icon data-icon className="size-4" />
                Step {index + 1}
              </span>
              <h3 className="font-heading text-base font-medium">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
