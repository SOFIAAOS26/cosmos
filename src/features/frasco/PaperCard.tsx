import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/utils/cn';
import { useSignedUrl } from '@/features/media/useSignedUrls';
import { paperColorStyle, paperIntentionStyle, PAPER_INK } from '@/types/models';
import type { MemoryPaper } from '@/types/database';

interface PaperCardProps {
  paper: MemoryPaper;
  authorName?: string;
  /** Show the little "opened N times" line (§15). */
  showOpened?: boolean;
  className?: string;
}

/** An opened paper, rendered as a small handwritten letter (§9, §10, §35). */
export function PaperCard({ paper, authorName, showOpened, className }: PaperCardProps) {
  const c = paperColorStyle(paper.color);
  const intention = paperIntentionStyle(paper.intention);
  const photo = useSignedUrl(paper.image_url);
  const date = format(new Date(paper.created_at), "d 'de' MMMM yyyy", { locale: es });

  return (
    <div
      className={cn('relative w-full max-w-[22rem] rounded-xl p-5', className)}
      style={{
        color: PAPER_INK,
        background: `linear-gradient(135deg, ${c.paper} 0%, ${c.shade} 120%)`,
        boxShadow: '0 24px 60px -18px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.5)',
      }}
    >
      {/* Optional Polaroid photo, pinned to the paper */}
      {paper.image_url && photo && (
        <div
          className="mx-auto mb-4 w-40 -rotate-2 bg-white p-2 pb-6 shadow-lg"
          style={{ boxShadow: '0 10px 24px -8px rgba(0,0,0,0.5)' }}
        >
          <img src={photo} alt="" className="h-36 w-full object-cover" />
          {/* tape */}
          <span className="absolute left-1/2 top-2 h-5 w-16 -translate-x-1/2 -rotate-3 rounded-sm bg-white/50" />
        </div>
      )}

      <p className="whitespace-pre-wrap font-hand text-2xl leading-snug" style={{ color: PAPER_INK }}>
        {paper.message}
      </p>

      <div className="mt-5 text-right">
        <span className="font-hand text-xl" style={{ color: PAPER_INK }}>
          — {authorName ?? 'Alguien'}
        </span>
        <p className="mt-0.5 text-xs" style={{ color: 'rgba(46,42,36,0.6)' }}>
          {date}
        </p>
      </div>

      <div
        className="mt-4 flex items-center justify-between border-t pt-3 text-xs"
        style={{ borderColor: 'rgba(46,42,36,0.12)', color: 'rgba(46,42,36,0.6)' }}
      >
        <span>
          {intention.emoji} {intention.label}
        </span>
        <span>♡ Guardado en Cosmos</span>
      </div>

      {showOpened && paper.opened_count > 1 && (
        <p className="mt-2 text-center text-[11px]" style={{ color: 'rgba(46,42,36,0.5)' }}>
          Abierto {paper.opened_count} veces
        </p>
      )}
    </div>
  );
}
