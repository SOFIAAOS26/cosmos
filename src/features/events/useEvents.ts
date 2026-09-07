import { useCallback, useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useCosmos } from '@/providers/CosmosProvider';
import { useRealtimeTable } from '@/hooks/useRealtime';
import { todayKey } from '@/utils/date';
import type { CosmosEvent } from '@/types/database';

/** Upcoming events for the cosmos (today onward), kept live. */
export function useUpcomingEvents(): { events: CosmosEvent[]; loading: boolean; refresh: () => Promise<void> } {
  const { cosmos } = useCosmos();
  const [events, setEvents] = useState<CosmosEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!cosmos) {
      setEvents([]);
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('cosmos_id', cosmos.id)
      .gte('date', todayKey(cosmos.timezone))
      .order('date', { ascending: true })
      .order('time', { ascending: true, nullsFirst: true });
    setEvents(data ?? []);
    setLoading(false);
  }, [cosmos]);

  useEffect(() => {
    void load();
  }, [load]);
  useRealtimeTable('events', cosmos?.id, () => void load());

  return { events, loading, refresh: load };
}
