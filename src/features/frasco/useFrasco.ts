import { useCallback, useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useCosmos } from '@/providers/CosmosProvider';
import { useRealtimeTable } from '@/hooks/useRealtime';
import type { MemoryPaper } from '@/types/database';

export interface FrascoData {
  papers: MemoryPaper[];
  count: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

/** All papers the viewer may see in this cosmos (RLS hides others' secrets). */
export function useFrasco(): FrascoData {
  const { cosmos } = useCosmos();
  const [papers, setPapers] = useState<MemoryPaper[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!cosmos) {
      setPapers([]);
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    const { data } = await supabase
      .from('memory_papers')
      .select('*')
      .eq('cosmos_id', cosmos.id)
      .order('created_at', { ascending: true });
    setPapers(data ?? []);
    setLoading(false);
  }, [cosmos]);

  useEffect(() => {
    void load();
  }, [load]);
  useRealtimeTable('memory_papers', cosmos?.id, () => void load());

  return { papers, count: papers.length, loading, refresh: load };
}
