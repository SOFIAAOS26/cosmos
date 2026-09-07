import { useCallback, useEffect, useState } from 'react';
import { MapPin, Clock } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { EmptyState, GlassCard, Card, Badge } from '@/components/ui';
import { NextMomentCard } from '@/features/observatory/NextMomentCard';
import { getSupabase } from '@/lib/supabase';
import { useCosmos } from '@/providers/CosmosProvider';
import { useRealtimeTable } from '@/hooks/useRealtime';
import { formatKey, todayKey } from '@/utils/date';
import type { BucketItem, CosmosEvent } from '@/types/database';

/**
 * FUTURE — plans & anticipation (§21–§24).
 * Foundation: the primary countdown, upcoming events, and the bucket list (reads).
 * Creating events/countdowns/tickets arrives in the Events phase.
 */
export function FutureScreen() {
  const { cosmos } = useCosmos();
  const [events, setEvents] = useState<CosmosEvent[] | null>(null);
  const [bucket, setBucket] = useState<BucketItem[] | null>(null);

  const load = useCallback(async () => {
    if (!cosmos) return;
    const supabase = getSupabase();
    const [ev, bk] = await Promise.all([
      supabase
        .from('events')
        .select('*')
        .eq('cosmos_id', cosmos.id)
        .gte('date', todayKey(cosmos.timezone))
        .order('date', { ascending: true }),
      supabase
        .from('bucket_items')
        .select('*')
        .eq('cosmos_id', cosmos.id)
        .order('created_at', { ascending: false }),
    ]);
    setEvents(ev.data ?? []);
    setBucket(bk.data ?? []);
  }, [cosmos]);

  useEffect(() => {
    void load();
  }, [load]);
  useRealtimeTable('events', cosmos?.id, () => void load());
  useRealtimeTable('bucket_items', cosmos?.id, () => void load());

  const emptyEverything = events?.length === 0 && bucket?.length === 0;

  return (
    <Screen title="Futuro" subtitle="Lo que queremos vivir">
      <div className="space-y-6">
        <NextMomentCard />

        {emptyEverything ? (
          <EmptyState nedi="observing" message="El futuro está esperando." />
        ) : (
          <>
            {events && events.length > 0 && (
              <section>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-faint">
                  Próximos eventos
                </h2>
                <div className="space-y-2">
                  {events.map((ev) => (
                    <Card key={ev.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-ink">{ev.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-ink-faint">
                          <span>{formatKey(ev.date)}</span>
                          {ev.time && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {ev.time}
                            </span>
                          )}
                          {ev.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {ev.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge tone="aura">{ev.type}</Badge>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {bucket && bucket.length > 0 && (
              <section>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-faint">
                  Bucket list
                </h2>
                <GlassCard padded>
                  <ul className="space-y-2">
                    {bucket.map((b) => (
                      <li key={b.id} className="flex items-center gap-2 text-sm">
                        <span
                          className={
                            b.completed ? 'text-ink-faint line-through' : 'text-ink'
                          }
                        >
                          {b.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </section>
            )}
          </>
        )}
      </div>
    </Screen>
  );
}
