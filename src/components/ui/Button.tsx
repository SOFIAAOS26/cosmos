import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'blossom' | 'ghost' | 'subtle' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const base =
  'relative inline-flex items-center justify-center gap-2 font-medium select-none ' +
  'rounded-lg transition-all duration-150 ease-cosmos ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-void ' +
  'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-ink text-void hover:bg-white focus-visible:ring-white/70 shadow-lift',
  blossom:
    'bg-blossom text-void hover:bg-blossom-soft focus-visible:ring-blossom/70 shadow-blossom',
  ghost:
    'bg-transparent text-ink hover:bg-white/5 focus-visible:ring-white/30',
  subtle:
    'bg-white/5 text-ink hover:bg-white/10 border border-white/5 focus-visible:ring-white/30',
  danger:
    'bg-transparent text-blossom hover:bg-blossom/10 border border-blossom/30 focus-visible:ring-blossom/50',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-[0.95rem]',
  lg: 'h-14 px-6 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      <span className={cn(loading && 'opacity-70')}>{children}</span>
    </button>
  );
});
