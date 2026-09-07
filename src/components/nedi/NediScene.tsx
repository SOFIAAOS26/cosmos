import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Nedi, type NediProps } from './Nedi';

export interface NediSceneProps extends NediProps {
  /** A short, quiet line beside Nedi (empty states, moments). Keep it tiny (§5). */
  caption?: ReactNode;
  align?: 'center' | 'start';
  className?: string;
}

/**
 * Nedi in context — the character plus an optional whisper of text.
 * Used for empty states and gentle moments. No big speech bubbles (§5).
 */
export function NediScene({
  caption,
  align = 'center',
  className,
  size = 128,
  ...nedi
}: NediSceneProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      <Nedi size={size} {...nedi} />
      {caption && (
        <p className="max-w-[22rem] text-balance text-sm leading-relaxed text-ink-soft">
          {caption}
        </p>
      )}
    </div>
  );
}
