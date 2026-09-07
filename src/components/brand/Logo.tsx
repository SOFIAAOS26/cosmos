import { cn } from '@/utils/cn';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withTagline?: boolean;
  className?: string;
}

const sizes = {
  sm: 'text-xl tracking-[0.35em]',
  md: 'text-3xl tracking-[0.4em]',
  lg: 'text-5xl tracking-[0.45em]',
  xl: 'text-6xl tracking-[0.5em]',
};

/** The COSMOS wordmark. Editorial, spaced, luminous. */
export function Logo({ size = 'md', withTagline = false, className }: LogoProps) {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <h1 className={cn('font-display font-medium text-ink', sizes[size])}>
        <span className="pl-[0.35em]">COSMOS</span>
      </h1>
      {withTagline && (
        <p className="mt-2 font-display text-sm italic text-ink-soft">our little universe.</p>
      )}
    </div>
  );
}
