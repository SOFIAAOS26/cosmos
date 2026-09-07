import { useCallback, useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useCosmos } from '@/providers/CosmosProvider';
import { useRealtimeTable } from '@/hooks/useRealtime';
import { todayKey } from '@/utils/date';

export interface NextMoment {
  title: string;
  /** ISO target instant. */
  target: string;
  source: 'countdown' | 'event';
}

/**
 * The next big moment (§11, §24): the primary countdown if set, otherwise the
 * nearest upcoming event. Always derived from a real date.
 */
export function usePrimaryCountdown(): { moment: NextMoment | null; loading: boolean } {
  const { cosmos } = useCosmos();
  const [moment, setMoment] = useState<NextMoment | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!cosmos) {
      setMoment(null);
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    setLoading(true);

    const { data: primary } = await supabase
      .from('countdowns')
      .select('*')
      .eq('cosmos_id', cosmos.id)
      .eq('is_primary', true)
      .maybeSingle();

    if (primary) {
      setMoment({ title: primary.title, target: primary.target_date, source: 'countdown' });
      setLoading(false);
      return;
    }

    const { data: ev } = await supabase
      .from('events')
      .select('*')
      .eq('cosmos_id', cosmos.id)
      .gte('date', todayKey(cosmos.timezone))
      .order('date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (ev) {
      const target = new Date(`${ev.date}T${ev.time ?? '00:00'}:00`).toISOString();
      setMoment({ title: ev.title, target, source: 'event' });
    } else {
      setMoment(null);
    }
    setLoading(false);
  }, [cosmos]);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeTable('countdowns', cosmos?.id, () => void load());
  useRealtimeTable('events', cosmos?.id, () => void load());

  return { moment, loading };
}
