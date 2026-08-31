"use client";

import {
  IconDeviceDesktop,
  IconDeviceIpad,
  IconDeviceMobile,
  IconExternalLink,
} from "@tabler/icons-react";
import * as React from "react";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

/** Widths the preset buttons snap to, widest first. */
const viewportPresets = [
  { id: "desktop", label: "Desktop", width: 1440, icon: IconDeviceDesktop },
  { id: "tablet", label: "Tablet", width: 834, icon: IconDeviceIpad },
  { id: "mobile", label: "Mobile", width: 390, icon: IconDeviceMobile },
] as const;

const minViewportWidth = 320;
const maxViewportWidth = 1920;

type PagePreviewFrameProps = {
  /** Registry item name, used to build the `/view/<name>` embed URL. */
  name: string;
  title: string;
};

/**
 * Resizable viewport for a full-page preview.
 *
 * The preview is embedded in an iframe rather than a sized `div` because
 * Tailwind breakpoints resolve against the viewport: only a nested document
 * actually re-lays-out from desktop to phone as the frame narrows.
 */
export function PagePreviewFrame({ name, title }: PagePreviewFrameProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState<number | null>(null);
  const [available, setAvailable] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const stopDragRef = React.useRef<(() => void) | null>(null);

  // Until the track is measured, the frame renders full-bleed. That keeps the
  // server render and first paint identical instead of guessing a width.
  React.useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setAvailable(Math.round(entry.contentRect.width));
      }
    });

    observer.observe(track);

    return () => {
      observer.disconnect();
    };
  }, []);

  React.useEffect(() => () => stopDragRef.current?.(), []);

  const maxWidth = available > 0 ? Math.min(available, maxViewportWidth) : maxViewportWidth;
  const appliedWidth = width === null ? maxWidth : Math.min(width, maxWidth);

  function clampWidth(value: number) {
    return Math.max(minViewportWidth, Math.min(Math.round(value), maxWidth));
  }

  function handleResize(event: React.PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const bounds = track.getBoundingClientRect();
    const center = bounds.left + bounds.width / 2;

    // The frame stays centred, so a drag moves both edges: the pointer covers
    // half the width change.
    const update = (clientX: number) => {
      setWidth(clampWidth((clientX - center) * 2));
    };

    const onMove = (moveEvent: PointerEvent) => {
      update(moveEvent.clientX);
    };

    const stop = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      stopDragRef.current = null;
      setDragging(false);
    };

    // Listening on the window rather than the handle keeps the drag alive when
    // the pointer outruns the 16px grip.
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    stopDragRef.current = stop;

    update(event.clientX);
    setDragging(true);
  }

  return (
    <div data-slot="page-preview-frame" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          {viewportPresets.map((preset) => {
            const Icon = preset.icon;
            const isActive = appliedWidth === Math.min(preset.width, maxWidth);

            return (
              <Button
                key={preset.id}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                aria-pressed={isActive}
                onClick={() => setWidth(clampWidth(preset.width))}
              >
                <Icon data-icon="inline-start" />
                {preset.label}
              </Button>
            );
          })}
        </div>

        <Separator orientation="vertical" className="h-5" />

        <p className="m-0 text-xs text-muted-foreground tabular-nums" aria-live="polite">
          {appliedWidth}px
        </p>

        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          nativeButton={false}
          render={<a href={`/view/${name}`} target="_blank" rel="noreferrer" />}
        >
          <IconExternalLink data-icon="inline-start" />
          Open
        </Button>
      </div>

      <div ref={trackRef} className="relative w-full">
        <div
          className="relative mx-auto overflow-hidden rounded-lg border bg-background transition-[width] duration-200 ease-out data-[dragging=true]:transition-none"
          data-dragging={dragging}
          style={{ width: appliedWidth }}
        >
          {/* oxlint-disable-next-line react/iframe-missing-sandbox --
              Same-origin first-party route. The preview needs allow-scripts to
              hydrate and allow-same-origin to read the theme from localStorage,
              and that pair cancels a sandbox out, so declaring one would only
              be misleading. */}
          <iframe
            src={`/view/${name}`}
            title={`${title} preview`}
            loading="lazy"
            // Pointer events are suppressed mid-drag so the iframe does not
            // swallow the pointer as the edge sweeps across it.
            className={cn("h-[46rem] w-full border-0", dragging && "pointer-events-none")}
          />
        </div>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize preview"
          aria-valuenow={appliedWidth}
          aria-valuemin={minViewportWidth}
          aria-valuemax={maxWidth}
          tabIndex={0}
          onPointerDown={handleResize}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 100 : 20;

            if (event.key === "ArrowLeft") {
              event.preventDefault();
              setWidth(clampWidth(appliedWidth - step));
            }

            if (event.key === "ArrowRight") {
              event.preventDefault();
              setWidth(clampWidth(appliedWidth + step));
            }
          }}
          style={{ left: `calc(50% + ${appliedWidth / 2}px)` }}
          className="absolute inset-y-0 hidden w-4 -translate-x-1/2 cursor-ew-resize touch-none place-items-center rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:grid"
        >
          <span aria-hidden="true" className="h-10 w-1 rounded-full bg-border" />
        </div>
      </div>
    </div>
  );
}
