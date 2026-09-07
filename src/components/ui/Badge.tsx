import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type Tone = 'neutral' | 'noir' | 'blossom' | 'aura' | 'high';

const tones: Record<Tone, string> = {
  neutral: 'bg-white/5 text-ink-soft border-white/10',
  noir: 'bg-white/5 text-noir border-white/15',
  blossom: 'bg-blossom/10 text-blossom border-blossom/25',
  aura: 'bg-aura/10 text-aura border-aura/25',
  high: 'bg-blossom/15 text-blossom-soft border-blossom/30',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
