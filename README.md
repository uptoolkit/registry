# Uptoolkit Registry

<p align="center"><a href="https://ui.uptoolkit.com"><img width="2776" height="1596" alt="Uptoolkit Registry" src="https://github.com/user-attachments/assets/04bbb481-9ca8-49c3-bc83-b7d9a72e4b61" /></a></p>

A [shadcn-compatible registry](https://ui.shadcn.com/docs/registry) of installable components, blocks, hooks, and utilities — the **design system for those who don't have one**.

Built with [TanStack Start](https://tanstack.com/start/latest) and [Vite+](https://viteplus.dev/), the registry ships typed registry items, authored docs, live preview pages, syntax-highlighted source snippets, and TanStack Start server routes.

➡️ **[ui.uptoolkit.com](https://ui.uptoolkit.com)**

## Install Items

Use the shadcn CLI to add any registry item to your project:

```bash
# npm
npx shadcn@latest add https://ui.uptoolkit.com/r/<name>.json

# pnpm
pnpm dlx shadcn@latest add https://ui.uptoolkit.com/r/<name>.json

# bun
bunx shadcn@latest add https://ui.uptoolkit.com/r/<name>.json
```

Browse the full catalog at [ui.uptoolkit.com/components](https://ui.uptoolkit.com/components).

## Development

Ensure you have [Vite+](https://viteplus.dev/guide/) (`vp`) installed, then:

```bash
# Install Vite+
curl -fsSL https://vite.plus | bash

# Install dependencies and start the local server
vp install
vp dev
```

## Agent Skill

This repository includes an installable Agent Skill for authoring registry items. Install it using the [Skills CLI](https://skills.sh/):

```bash
npx skills add uptoolkit/registry --skill shadcn-registry
```

After installing the skill, ask your agent for registry authoring work directly:

- "add a button component to the registry"
- "adapt this modal from my app to make it reusable via this shadcn registry"
- "add a reusable hook to the registry"
- "turn this dashboard section into a registry block"

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fuptoolkit%2Fregistry&project-name=uptoolkit-registry&repository-name=registry&demo-title=Uptoolkit%20Registry&demo-url=https%3A%2F%2Fui.uptoolkit.com)

Deploy to Vercel as a platform-agnostic [Nitro server](https://nitro.build/). Other platforms (Cloudflare Workers, Netlify, etc.) are also supported via the [TanStack Start hosting docs](https://tanstack.com/start/latest/docs/framework/react/guide/hosting#deployment).

## Configuration

Registry identity is controlled in [`registry/config.ts`](registry/config.ts):

```ts
export const registryConfig = {
  name: "Uptoolkit",
  registryName: "uptoolkit",
  namespace: "@uptoolkit",
  description: "Design system for those who don't have one.",
  homepage: "https://ui.uptoolkit.com",
  logo: "https://uptoolkit.com/favicon.svg",
  repositoryUrl: "https://github.com/uptoolkit/registry",
} as const;
```

## Add A Registry Item

### Automatic

Run `bun --bun ./scripts/new.ts` to interactively scaffold new registry items under `registry/items/**`.

Run `bun --bun ./scripts/doctor.ts` after making changes to validate registry metadata.

### Manual

Create a folder under `registry/items/<section>/<item-name>/`.

```text
registry/items/components/example-card/
  _registry.mdx
  _preview.tsx
  example-card.tsx
```

Write metadata and usage docs in `_registry.mdx`:

````mdx
---
name: example-card
type: registry:ui
title: Example Card
description: A compact card component.
registryDependencies:
  - card
---

Use the component anywhere you need a compact content summary.

```tsx
import { ExampleCard } from "@/components/ui/example-card";

export function Example() {
  return <ExampleCard />;
}
```
````

Put the interactive preview in `_preview.tsx`:

```tsx
"use client";

import { ExampleCard } from "./example-card";

export function Preview() {
  return <ExampleCard />;
}
```

## Server Routes

- `/registry.json` — registry index
- `/r/registry.json` — same registry index
- `/r/<name>.json` — installable item JSON
- `/llms.txt` and `/llms-full.txt` — LLM-friendly docs

Human-facing registry URLs also support shadcn CLI content negotiation (`Accept: application/vnd.shadcn.v1+json` or `User-Agent: shadcn`).

## License

[MIT](LICENSE)
