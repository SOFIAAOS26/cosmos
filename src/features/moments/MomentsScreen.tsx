import { useCallback, useEffect, useState } from 'react';
import { Screen } from '@/components/layout/Screen';
import { EmptyState, Skeleton } from '@/components/ui';
import { getSupabase } from '@/lib/supabase';
import { useCosmos } from '@/providers/CosmosProvider';
import { useRealtimeTable } from '@/hooks/useRealtime';
import { formatKey } from '@/utils/date';
import type { Memory } from '@/types/database';

/**
 * MOMENTS — the past (§14, §16). Postcards of what you've lived.
 * Foundation: a lazy, thumbnailed gallery with a carefully designed empty state.
 * Full authoring (photo upload, stickers, soundtrack) arrives in the Memories phase.
 */
export function MomentsScreen() {
  const { cosmos } = useCosmos();
  const [memories, setMemories] = useState<Memory[] | null>(null);

  const load = useCallback(async () => {
    if (!cosmos) return;
    const supabase = getSupabase();
    const { data } = await supabase
      .from('memories')
      .select('*')
      .eq('cosmos_id', cosmos.id)
      .order('date', { ascending: false });
    setMemories(data ?? []);
  }, [cosmos]);

  useEffect(() => {
    void load();
  }, [load]);
  useRealtimeTable('memories', cosmos?.id, () => void load());

  return (
    <Screen title="Momentos" subtitle="Lo que hemos vivido">
      {memories === null ? (
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="aspect-[3/4]" />
          <Skeleton className="aspect-[3/4]" />
        </div>
      ) : memories.length === 0 ? (
        <EmptyState nedi="idle" message="Todavía no hay estrellas aquí." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {memories.map((m) => (
            <article
              key={m.id}
              className="group overflow-hidden rounded-xl border border-white/5 bg-surface"
            >
              <div className="aspect-[3/4] w-full overflow-hidden bg-surface-elevated">
                {m.photo_url ? (
                  <img
                    src={m.photo_url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-3 text-center text-xs text-ink-faint">
                    {m.story?.slice(0, 80) ?? 'Recuerdo'}
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-[11px] text-ink-faint">{formatKey(m.date)}</p>
                {m.story && <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">{m.story}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </Screen>
  );
}
