import { useMemo } from 'react';
import { Shuffle } from 'lucide-react';
import { BottomSheet } from '@/components/ui';
import { cn } from '@/utils/cn';
import { PAPER_INTENTIONS, type PaperIntention } from '@/types/models';
import type { MemoryPaper } from '@/types/database';

interface PaperPickerProps {
  open: boolean;
  papers: MemoryPaper[];
  onClose: () => void;
  /** null = surprise me (any paper, regardless of occasion). */
  onPick: (intention: PaperIntention | null) => void;
}

/**
 * Choose the occasion before opening (§28): only occasions that actually hold
 * papers the viewer can see are offered, each with its count, plus a
 * "sorpréndeme" that ignores the filter. Secret papers already come pre-filtered
 * by RLS, so the counts here are always truthful for this viewer.
 */
export function PaperPicker({ open, papers, onClose, onPick }: PaperPickerProps) {
  const available = useMemo(() => {
    const counts = new Map<PaperIntention, number>();
    for (const p of papers) counts.set(p.intention, (counts.get(p.intention) ?? 0) + 1);
    return PAPER_INTENTIONS.filter((i) => (counts.get(i.key) ?? 0) > 0).map((i) => ({
      ...i,
      count: counts.get(i.key) ?? 0,
    }));
  }, [papers]);

  return (
    <BottomSheet open={open} onClose={onClose} title="¿Qué papelito abrimos?">
      <div className="space-y-2 py-2">
        <p className="px-1 pb-1 text-sm text-ink-soft">
          Elige la ocasión y abriremos uno que guardamos justo para eso.
        </p>

        {/* Surprise me — any paper, any occasion */}
        <button
          type="button"
          onClick={() => onPick(null)}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl border border-blossom/30 bg-blossom/10 px-4 py-3 text-left',
            'transition-colors hover:bg-blossom/15 active:scale-[0.99]',
          )}
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-blossom/20 text-blossom">
            <Shuffle className="h-4 w-4" />
          </span>
          <span className="flex-1">
            <span className="block font-display text-base text-ink">Sorpréndeme</span>
            <span className="block text-xs text-ink-faint">Cualquiera del frasco</span>
          </span>
        </button>

        {/* Occasions that actually have papers */}
        {available.map((i) => (
          <button
            key={i.key}
            type="button"
            onClick={() => onPick(i.key)}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left',
              'transition-colors hover:bg-white/[0.08] active:scale-[0.99]',
            )}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5 text-xl">
              {i.emoji}
            </span>
            <span className="flex-1 font-display text-base text-ink">{i.label}</span>
            <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-xs text-ink-faint">
              {i.count}
            </span>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
