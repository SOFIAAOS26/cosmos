import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label — required, since the button has no visible text. */
  label: string;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

const sizes = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-12 w-12',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size = 'md', active, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center justify-center rounded-full text-ink-soft',
        'transition-all duration-150 ease-cosmos active:scale-95',
        'hover:bg-white/5 hover:text-ink',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
        active && 'bg-white/5 text-ink',
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
