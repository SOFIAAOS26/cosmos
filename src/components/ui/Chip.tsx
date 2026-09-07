import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

/** A small, tappable filter/selector chip. */
export function Chip({ selected, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm',
        'transition-all duration-150 ease-cosmos active:scale-[0.97]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
        selected
          ? 'border-transparent bg-ink text-void'
          : 'border-white/10 bg-white/5 text-ink-soft hover:text-ink hover:bg-white/10',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
