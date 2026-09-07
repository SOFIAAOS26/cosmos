import { useCallback, useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useCosmos } from '@/providers/CosmosProvider';
import { useRealtimeTable } from '@/hooks/useRealtime';
import type { CosmosEvent, Memory, Task } from '@/types/database';
import type { DateKey } from '@/utils/date';

export interface DayData {
  memory: Memory | null;
  tasks: Task[];
  events: CosmosEvent[];
  loading: boolean;
  refresh: () => Promise<void>;
}

/** Everything that happens on one day: its postcard, tasks and events. */
export function useDay(dateKey: DateKey | null): DayData {
  const { cosmos } = useCosmos();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CosmosEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!cosmos || !dateKey) {
      setMemory(null);
      setTasks([]);
      setEvents([]);
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    setLoading(true);
    const [mem, tk, ev] = await Promise.all([
      supabase
        .from('memories')
        .select('*')
        .eq('cosmos_id', cosmos.id)
        .eq('date', dateKey)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('tasks')
        .select('*')
        .eq('cosmos_id', cosmos.id)
        .eq('date', dateKey)
        .order('created_at', { ascending: true }),
      supabase
        .from('events')
        .select('*')
        .eq('cosmos_id', cosmos.id)
        .eq('date', dateKey)
        .order('time', { ascending: true, nullsFirst: true }),
    ]);
    setMemory(mem.data ?? null);
    setTasks(tk.data ?? []);
    setEvents(ev.data ?? []);
    setLoading(false);
  }, [cosmos, dateKey]);

  useEffect(() => {
    void load();
  }, [load]);

  // Keep the day live (§25).
  useRealtimeTable('tasks', cosmos?.id, () => void load());
  useRealtimeTable('memories', cosmos?.id, () => void load());
  useRealtimeTable('events', cosmos?.id, () => void load());

  return { memory, tasks, events, loading, refresh: load };
}
