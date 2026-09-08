import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useCosmos } from '@/providers/CosmosProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useRealtimeTable } from '@/hooks/useRealtime';
import type { Notification } from '@/types/database';

export function useNotifications() {
  const { cosmos } = useCosmos();
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!cosmos || !user) {
      setItems([]);
      setLoading(false);
      return;
    }
    const supabase = getSupabase();
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setItems(data ?? []);
    setLoading(false);
  }, [cosmos, user]);

  useEffect(() => {
    void load();
  }, [load]);
  useRealtimeTable('notifications', cosmos?.id, () => void load());

  const unread = useMemo(() => items.filter((n) => !n.read_at).length, [items]);

  return { items, unread, loading, refresh: load };
}
