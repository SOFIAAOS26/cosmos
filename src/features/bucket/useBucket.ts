import { useCallback, useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useCosmos } from '@/providers/CosmosProvider';
import { useRealtimeTable } from '@/hooks/useRealtime';
import type { BucketItem } from '@/types/database';

export function useBucket(): { items: BucketItem[]; loading: boolean; refresh: () => Promise<void> } {
  const { cosmos } = useCosmos();
  const [items, setItems] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!cosmos) {
      setItems([]);
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    setLoading(true);
    const { data } = await supabase
      .from('bucket_items')
      .select('*')
      .eq('cosmos_id', cosmos.id)
      .order('completed', { ascending: true })
      .order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }, [cosmos]);

  useEffect(() => {
    void load();
  }, [load]);
  useRealtimeTable('bucket_items', cosmos?.id, () => void load());

  return { items, loading, refresh: load };
}
