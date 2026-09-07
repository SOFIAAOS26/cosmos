import { Music, Play } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Song } from '@/types/database';

/**
 * A small musical object bound to a memory (§15, §18) — a little vinyl, not a
 * full player. Tapping opens the track on its platform.
 */
export function SoundtrackCard({ song, className }: { song: Song; className?: string }) {
  const isSpotify = song.platform === 'spotify';
  return (
    <a
      href={song.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-white/5 bg-surface p-2.5 transition-colors hover:bg-surface-elevated',
        className,
      )}
    >
      {/* Vinyl / thumbnail */}
      <span className="relative h-12 w-12 shrink-0">
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center overflow-hidden rounded-full',
            isSpotify ? 'bg-[#1DB954]/15' : 'bg-blossom/15',
          )}
        >
          {song.thumbnail ? (
            <img src={song.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <Music className={cn('h-5 w-5', isSpotify ? 'text-[#1DB954]' : 'text-blossom')} />
          )}
        </span>
        <span className="absolute inset-0 m-auto h-2.5 w-2.5 rounded-full bg-void ring-2 ring-white/20" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-ink">{song.title || 'Su canción'}</p>
        <p className="truncate text-xs text-ink-faint">
          {song.artist ? `${song.artist} · ` : ''}
          {isSpotify ? 'Spotify' : 'YouTube'}
        </p>
      </div>

      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-ink-soft transition-colors group-hover:text-ink">
        <Play className="h-4 w-4" />
      </span>
    </a>
  );
}
