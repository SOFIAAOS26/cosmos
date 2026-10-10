import { ExternalLink, LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSignedUrl } from '@/features/media/useSignedUrls';
import { parseSongUrl } from '@/features/memories/soundtrack';
import type { Comet } from '@/types/database';

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** The content of a comet: a photo, a song/link, and the note. */
export function CometCard({ comet, authorName }: { comet: Comet; authorName?: string }) {
  const img = useSignedUrl(comet.image_url);
  const song = comet.link_url ? parseSongUrl(comet.link_url) : null;

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-surface-elevated p-4 shadow-2xl">
      <p className="mb-3 text-xs uppercase tracking-widest text-blossom-soft">
        {authorName ? `${authorName} te mandó un cometa` : 'Un cometa'}
      </p>

      {/* Photo */}
      {comet.image_url && (
        <div className="mb-3 overflow-hidden rounded-xl bg-void">
          {img ? (
            <img src={img} alt="" className="max-h-72 w-full object-cover" />
          ) : (
            <div className="aspect-video w-full animate-pulse bg-white/5" />
          )}
        </div>
      )}

      {/* Song embed (Spotify / YouTube) */}
      {song?.embedUrl && (
        <div className="mb-3 overflow-hidden rounded-xl">
          <iframe
            src={song.embedUrl}
            title="cometa"
            className="h-[152px] w-full"
            loading="lazy"
            allow="encrypted-media; clipboard-write; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )}

      {/* Generic link (reel, TikTok, anything) */}
      {comet.link_url && !song && (
        <a
          href={comet.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/5 text-blossom-soft">
            <LinkIcon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-ink">{hostOf(comet.link_url)}</span>
            <span className="block text-xs text-ink-faint">Toca para abrir</span>
          </span>
          <ExternalLink className="h-4 w-4 shrink-0 text-ink-faint" />
        </a>
      )}

      {/* Note */}
      {comet.note && <p className="font-hand text-2xl leading-snug text-ink break-words">{comet.note}</p>}

      <p className="mt-3 text-xs text-ink-faint">
        {format(new Date(comet.created_at), "d 'de' MMMM", { locale: es })}
      </p>
    </div>
  );
}
