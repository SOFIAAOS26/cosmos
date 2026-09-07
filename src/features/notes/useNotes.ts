import { useCallback, useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useCosmos } from '@/providers/CosmosProvider';
import { useRealtimeTable } from '@/hooks/useRealtime';
import type { Note } from '@/types/database';

export function useNotes(): { notes: Note[]; loading: boolean; refresh: () => Promise<void> } {
  const { cosmos } = useCosmos();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!cosmos) {
      setNotes([]);
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    setLoading(true);
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('cosmos_id', cosmos.id)
      .order('created_at', { ascending: false });
    setNotes(data ?? []);
    setLoading(false);
  }, [cosmos]);

  useEffect(() => {
    void load();
  }, [load]);
  useRealtimeTable('notes', cosmos?.id, () => void load());

  return { notes, loading, refresh: load };
}
