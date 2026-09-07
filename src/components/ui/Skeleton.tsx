import { cn } from '@/utils/cn';

/** A quiet loading placeholder — a faint shimmer, never noisy. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-white/[0.03] via-white/[0.07] to-white/[0.03]',
        className,
      )}
    />
  );
}
