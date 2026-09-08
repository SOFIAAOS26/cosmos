import { useEffect, useId, useRef } from 'react';
import type {
  RealtimePostgresChangesPayload,
  RealtimeChannel,
} from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type TableName = keyof Database['public']['Tables'];
type Row<T extends TableName> = Database['public']['Tables'][T]['Row'];

export type ChangeHandler<T extends TableName> = (
  payload: RealtimePostgresChangesPayload<Row<T>>,
) => void;

/**
 * Subscribe to realtime Postgres changes for a table, scoped to one cosmos (§25).
 *
 * Handles: subscription setup, filter by cosmos_id, cleanup on unmount/dep-change,
 * and reconnection (Supabase auto-reconnects; we re-subscribe if the channel is
 * torn down). The handler is kept in a ref so re-renders don't re-subscribe.
 */
export function useRealtimeTable<T extends TableName>(
  table: T,
  cosmosId: string | null | undefined,
  handler: ChangeHandler<T>,
  enabled = true,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  // A unique id per hook instance so multiple subscribers to the same table
  // (e.g. two components on one screen) each get their own channel — Supabase
  // rejects adding postgres_changes callbacks to an already-subscribed topic.
  const instanceId = useId();

  useEffect(() => {
    if (!enabled || !cosmosId) return;

    const supabase = getSupabase();
    let channel: RealtimeChannel | null = null;
    let disposed = false;

    const subscribe = () => {
      if (disposed) return;
      channel = supabase
        .channel(`cosmos:${cosmosId}:${table}:${instanceId}`)
        .on<Row<T>>(
          'postgres_changes',
          { event: '*', schema: 'public', table: table as string, filter: `cosmos_id=eq.${cosmosId}` },
          (payload) => handlerRef.current(payload),
        )
        .subscribe((status) => {
          // If the socket dropped and closed the channel, retry once shortly.
          if ((status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') && !disposed) {
            window.setTimeout(() => {
              if (channel) supabase.removeChannel(channel);
              channel = null;
              subscribe();
            }, 2000);
          }
        });
    };

    subscribe();

    return () => {
      disposed = true;
      if (channel) supabase.removeChannel(channel);
      channel = null;
    };
  }, [table, cosmosId, enabled, instanceId]);
}
