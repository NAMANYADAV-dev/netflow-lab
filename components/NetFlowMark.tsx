/* Compact two-node flow mark from the navigation reference: one cyan source,
   one magenta destination and the packet path joining them. */

export default function NetFlowMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 30 30"
      role="img"
      aria-label="NetFlow Lab"
      focusable="false"
    >
      <rect width="30" height="30" rx="4" fill="var(--logo-tile-bg)" />
      <path
        d="M8.5 21.5L21.5 8.5"
        stroke="var(--logo-path)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="8.5" cy="21.5" r="4" fill="var(--color-accent)" />
      <circle cx="21.5" cy="8.5" r="4" fill="var(--color-accent-2)" />
      <circle cx="15" cy="15" r="1.5" fill="var(--logo-center)" />
    </svg>
  );
}
