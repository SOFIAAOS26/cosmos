import { useCallback, useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useCosmos } from '@/providers/CosmosProvider';
import { useRealtimeTable } from '@/hooks/useRealtime';
import type { DateKey } from '@/utils/date';
import type { Task, TaskSupport, TaskReaction, TaskCheckin } from '@/types/database';

export interface RadarData {
  tasks: Task[];
  support: Record<string, TaskSupport[]>;
  reactions: Record<string, TaskReaction[]>;
  checkin: Record<string, TaskCheckin | undefined>;
  loading: boolean;
  refresh: () => Promise<void>;
}

/** A day's Task Radar with its support, reactions and check-ins — kept live (§25). */
export function useDayRadar(dateKey: DateKey | null): RadarData {
  const { cosmos } = useCosmos();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [support, setSupport] = useState<Record<string, TaskSupport[]>>({});
  const [reactions, setReactions] = useState<Record<string, TaskReaction[]>>({});
  const [checkin, setCheckin] = useState<Record<string, TaskCheckin | undefined>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!cosmos || !dateKey) {
      setTasks([]);
      setSupport({});
      setReactions({});
      setCheckin({});
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    setLoading(true);

    const { data: tk } = await supabase
      .from('tasks')
      .select('*')
      .eq('cosmos_id', cosmos.id)
      .eq('date', dateKey)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    const list = tk ?? [];
    setTasks(list);
    const ids = list.map((t) => t.id);

    if (ids.length === 0) {
      setSupport({});
      setReactions({});
      setCheckin({});
      setLoading(false);
      return;
    }

    const [sup, rea, chk] = await Promise.all([
      supabase.from('task_support').select('*').in('task_id', ids).order('created_at'),
      supabase.from('task_reactions').select('*').in('task_id', ids),
      supabase.from('task_checkins').select('*').in('task_id', ids).order('created_at', { ascending: false }),
    ]);

    const byTask = <T extends { task_id: string }>(rows: T[] | null): Record<string, T[]> => {
      const m: Record<string, T[]> = {};
      rows?.forEach((r) => {
        (m[r.task_id] ??= []).push(r);
      });
      return m;
    };
    setSupport(byTask(sup.data));
    setReactions(byTask(rea.data));

    const latest: Record<string, TaskCheckin | undefined> = {};
    chk.data?.forEach((c) => {
      if (!latest[c.task_id]) latest[c.task_id] = c; // ordered desc → first is latest
    });
    setCheckin(latest);
    setLoading(false);
  }, [cosmos, dateKey]);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeTable('tasks', cosmos?.id, () => void load());
  useRealtimeTable('task_support', cosmos?.id, () => void load());
  useRealtimeTable('task_reactions', cosmos?.id, () => void load());
  useRealtimeTable('task_checkins', cosmos?.id, () => void load());

  return { tasks, support, reactions, checkin, loading, refresh: load };
}
