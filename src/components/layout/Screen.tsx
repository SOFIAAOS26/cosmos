import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { pageVariants } from '@/theme/motion';

interface ScreenProps {
  title?: ReactNode;
  /** Small line under the title. */
  subtitle?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Remove default horizontal padding (for edge-to-edge content). */
  bleed?: boolean;
}

/**
 * A page container: safe-area aware header + scrollable content, with room
 * for the bottom nav on mobile.
 */
export function Screen({ title, subtitle, right, children, className, bleed }: ScreenProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col"
    >
      {(title || right) && (
        <header
          className={cn(
            'flex items-end justify-between gap-3 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-3',
          )}
        >
          <div className="min-w-0">
            {title && <h1 className="font-display text-2xl text-ink">{title}</h1>}
            {subtitle && <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      <div
        className={cn(
          'flex-1 pb-[calc(var(--nav-height)+1rem)] lg:pb-10',
          !bleed && 'px-5',
          className,
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}
