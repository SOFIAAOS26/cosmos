import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  glow?: 'none' | 'blossom' | 'aura';
}

/**
 * The signature COSMOS glass surface. Used sparingly (§10, §66).
 * Translucent, blurred, with a soft inner light.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  { padded = true, glow = 'none', className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'glass rounded-xl',
        padded && 'p-4',
        glow === 'blossom' && 'shadow-blossom',
        glow === 'aura' && 'shadow-aura',
        className,
      )}
      {...props}
    />
  );
});
