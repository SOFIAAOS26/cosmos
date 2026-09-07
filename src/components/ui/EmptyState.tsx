import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { NediScene } from '@/components/nedi';
import type { NediState } from '@/components/nedi';

export interface EmptyStateProps {
  /** The quiet line — e.g. "Todavía no hay estrellas aquí." (§41, §64) */
  message: ReactNode;
  nedi?: NediState;
  nediSize?: number;
  action?: ReactNode;
  className?: string;
}

/**
 * A carefully designed empty state (§41, §70).
 * It should feel like "this space is still ours", not "no data".
 */
export function EmptyState({ message, nedi = 'idle', nediSize = 120, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-6 px-6 py-12', className)}>
      <NediScene state={nedi} size={nediSize} caption={message} glow />
      {action}
    </div>
  );
}
