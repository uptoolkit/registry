"use client";

import { CompositeComponent, type AnyCompositeComponent } from "@tanstack/react-start/rsc";

type ComponentPreviewProps = {
  preview: AnyCompositeComponent | null;
};

export function ComponentPreview({ preview }: ComponentPreviewProps) {
  return (
    <div
      data-slot="component-preview"
      className="grid min-h-72 place-items-center rounded-lg border bg-background p-6"
    >
      {preview ? (
        <div
          data-slot="component-preview-stage"
          className="grid min-h-60 w-full place-items-center"
        >
          <CompositeComponent src={preview} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No preview is available for this item.</p>
      )}
    </div>
  );
}
