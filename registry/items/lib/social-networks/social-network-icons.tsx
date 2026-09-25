import type { SVGProps } from "react";

/** Minimal Grok mark for places Tabler does not ship a brand icon. */
function GrokIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M7.5 16.5 16.5 7.5" />
    </svg>
  );
}

export { GrokIcon };
