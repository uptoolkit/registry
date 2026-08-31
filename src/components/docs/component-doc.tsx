import { IconAppWindow, IconCode, IconFiles, IconTerminal } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import type { RegistryItemDetail } from "../../lib/registry/detail.server";
import { getRegistryItemRoutePath, getRegistrySectionForType } from "../../lib/registry/sections";
import { cn } from "../../lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CodeBlock } from "./code-block";
import { ComponentPreview } from "./component-preview";
import { DocsPageHeader } from "./docs-page-header";
import { InstallCommand } from "./install-command";
import { ManualInstallation } from "./manual-install";
import { PagePreviewFrame } from "./page-preview-frame";

type RegistryItemDocProps = {
  item: RegistryItemDetail;
};

export function RegistryItemDoc({ item }: RegistryItemDocProps) {
  const section = getRegistrySectionForType(item.type);
  const pagePath = getRegistryItemRoutePath(item);
  const isPageSection = section.id === "pages";

  return (
    <article className="flex min-w-0 flex-col gap-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/$section" params={{ section: section.id }} />}>
              {section.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{item.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <DocsPageHeader
        title={item.title}
        description={item.description}
        pagePath={pagePath}
        registryItemName={item.name}
      />

      {item.hasPreview ? (
        <Tabs
          key={`${item.name}:preview`}
          defaultValue="preview"
          // Page previews are full layouts, so they break out of the prose
          // column and use the slack either side of it on wide screens.
          className={cn("gap-4", isPageSection && "xl:-mx-24 2xl:-mx-56")}
        >
          <TabsList variant="line">
            <TabsTrigger value="preview">
              <IconAppWindow data-icon="inline-start" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code">
              <IconCode data-icon="inline-start" />
              Code
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            {isPageSection ? (
              <PagePreviewFrame name={item.name} title={item.title} />
            ) : (
              <ComponentPreview preview={item.preview ?? null} />
            )}
          </TabsContent>
          <TabsContent value="code">
            {item.previewSourceFile.source ? (
              <CodeBlock
                code={item.previewSourceFile.source}
                highlightedHtml={item.previewSourceFile.highlightedHtml}
              />
            ) : (
              <p className="text-sm text-muted-foreground">No preview source is available.</p>
            )}
          </TabsContent>
        </Tabs>
      ) : null}

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-semibold tracking-tight">Installation</h2>
        <Tabs key={`${item.name}:installation`} defaultValue="cli" className="gap-4">
          <TabsList variant="line">
            <TabsTrigger value="cli">
              <IconTerminal data-icon="inline-start" />
              CLI
            </TabsTrigger>
            <TabsTrigger value="manual">
              <IconFiles data-icon="inline-start" />
              Manual
            </TabsTrigger>
          </TabsList>
          <TabsContent value="cli">
            <InstallCommand item={{ name: item.name }} />
          </TabsContent>
          <TabsContent value="manual">
            <ManualInstallation
              item={{
                dependencies: item.dependencies,
                devDependencies: item.devDependencies,
                sourceFiles: item.sourceFiles,
              }}
            />
          </TabsContent>
        </Tabs>
      </section>

      {item.usage ? (
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-semibold tracking-tight">Usage</h2>
          {item.usage}
        </section>
      ) : null}
    </article>
  );
}
