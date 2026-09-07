import { useState } from 'react';
import { cn } from '@/utils/cn';
import { formatKey } from '@/utils/date';
import type { Memory } from '@/types/database';

interface MemoryCardProps {
  memory: Memory;
  photoUrl?: string | null;
  onClick?: () => void;
}

/** A postcard in the gallery — photo with a soft blur-up, or a text memory. */
export function MemoryCard({ memory, photoUrl, onClick }: MemoryCardProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group block overflow-hidden rounded-xl border border-white/5 bg-surface text-left transition-transform active:scale-[0.98]"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-elevated">
        {memory.photo_url && photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={cn(
              'h-full w-full object-cover transition-all duration-700 group-hover:scale-105',
              loaded ? 'blur-0 opacity-100' : 'blur-md opacity-0',
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-surface-elevated to-surface px-3 text-center">
            <p className="line-clamp-4 font-display text-sm text-ink-soft">
              {memory.story ?? 'Recuerdo'}
            </p>
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="text-[11px] text-ink-faint">{formatKey(memory.date)}</p>
        {memory.story && memory.photo_url && (
          <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">{memory.story}</p>
        )}
      </div>
    </button>
  );
}
