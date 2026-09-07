import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'section' | 'article';
  padded?: boolean;
}

/** A solid surface card. Photography and important content sit on these. */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { as: Tag = 'div', padded = true, className, ...props },
  ref,
) {
  return (
    <Tag
      ref={ref as never}
      className={cn(
        'rounded-xl border border-white/5 bg-surface',
        padded && 'p-4',
        className,
      )}
      {...props}
    />
  );
});
