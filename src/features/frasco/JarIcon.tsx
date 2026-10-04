interface JarIconProps {
  className?: string;
  strokeWidth?: number;
}

/** A little jar — the nav icon for "El Frasco de Nosotros". Matches Lucide's look. */
export function JarIcon({ className, strokeWidth = 1.8 }: JarIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* lid */}
      <path d="M8 3.5h8" />
      <path d="M9 3.5v1.6a3 3 0 0 1-.5 1.6" />
      <path d="M15 3.5v1.6a3 3 0 0 0 .5 1.6" />
      {/* body */}
      <path d="M7 8.2a3 3 0 0 1 2.2-2.1h5.6A3 3 0 0 1 17 8.2v9.3a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3Z" />
      {/* folded papers inside */}
      <path d="M8.5 15.5l2-1 1.5 1 2-1" />
      <path d="M8.5 18l2-0.8 1.5 0.8 2-0.8" />
    </svg>
  );
}
