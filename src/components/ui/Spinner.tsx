import { cn } from '@/utils/cn';

/** A quiet, on-brand loading indicator — a small orbiting point. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={cn(
        'inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/80',
        className,
      )}
    />
  );
}
