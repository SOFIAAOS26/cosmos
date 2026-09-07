import { useCallback, useEffect, useState } from 'react';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { getSupabase } from '@/lib/supabase';
import { useCosmos } from '@/providers/CosmosProvider';
import { useRealtimeTable } from '@/hooks/useRealtime';
import type { DateKey } from '@/utils/date';

export interface DayIndicators {
  memory: boolean;
  task: boolean;
  event: boolean;
}

export type IndicatorMap = Record<DateKey, DayIndicators>;

/** Small elegant dots per day (§14): does a day hold a memory / task / event? */
export function useMonthIndicators(monthDate: Date): IndicatorMap {
  const { cosmos } = useCosmos();
  const [map, setMap] = useState<IndicatorMap>({});

  const load = useCallback(async () => {
    if (!cosmos) {
      setMap({});
      return;
    }
    const from = format(startOfMonth(monthDate), 'yyyy-MM-dd');
    const to = format(endOfMonth(monthDate), 'yyyy-MM-dd');
    const supabase = getSupabase();

    const [mem, tk, ev] = await Promise.all([
      supabase.from('memories').select('date').eq('cosmos_id', cosmos.id).gte('date', from).lte('date', to),
      supabase.from('tasks').select('date').eq('cosmos_id', cosmos.id).gte('date', from).lte('date', to),
      supabase.from('events').select('date').eq('cosmos_id', cosmos.id).gte('date', from).lte('date', to),
    ]);

    const next: IndicatorMap = {};
    const touch = (key: string, field: keyof DayIndicators) => {
      next[key] = next[key] ?? { memory: false, task: false, event: false };
      next[key]![field] = true;
    };
    mem.data?.forEach((r) => touch(r.date, 'memory'));
    tk.data?.forEach((r) => touch(r.date, 'task'));
    ev.data?.forEach((r) => touch(r.date, 'event'));
    setMap(next);
  }, [cosmos, monthDate]);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeTable('tasks', cosmos?.id, () => void load());
  useRealtimeTable('memories', cosmos?.id, () => void load());
  useRealtimeTable('events', cosmos?.id, () => void load());

  return map;
}
