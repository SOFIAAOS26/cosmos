import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useCosmos } from '@/providers/CosmosProvider';
import { useRealtimeTable } from '@/hooks/useRealtime';
import { CometReveal } from './CometReveal';
import { markCometSeen, unseenForMe } from './api';
import type { Comet } from '@/types/database';

/**
 * Watches for comets waiting for me and unfolds them (§Hito8-C): the unseen
 * ones on app open, and any that arrive live while the app is open — one at a
 * time. Mounted once at the shell so it works on any screen. Seen is marked on
 * close, so a comet only auto-opens once.
 */
export function CometWatcher() {
  const { cosmos, members } = useCosmos();
  const { user } = useAuth();
  const [queue, setQueue] = useState<Comet[]>([]);

  const nameFor = useMemo(() => {
    const m = new Map(members.map((mem) => [mem.user_id, mem.profile.display_name]));
    return (id: string) => m.get(id);
  }, [members]);

  const enqueue = useCallback((c: Comet) => {
    setQueue((prev) => (prev.some((x) => x.id === c.id) ? prev : [...prev, c]));
  }, []);

  // Waiting for me on open.
  useEffect(() => {
    if (!cosmos || !user) return;
    let live = true;
    unseenForMe(cosmos.id, user.id)
      .then((rows) => {
        if (live) setQueue((prev) => [...prev, ...rows.filter((r) => !prev.some((p) => p.id === r.id))]);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [cosmos?.id, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Arriving live.
  useRealtimeTable('comets', cosmos?.id, (payload) => {
    if (payload.eventType !== 'INSERT') return;
    const row = payload.new as Comet;
    if (row.recipient_id === user?.id && !row.seen_at) enqueue(row);
  });

  const current = queue[0] ?? null;

  const close = useCallback(() => {
    if (current) void markCometSeen(current.id).catch(() => {});
    setQueue((prev) => prev.slice(1));
  }, [current]);

  return (
    <CometReveal
      comet={current}
      authorName={current ? nameFor(current.author_id) : undefined}
      open={current !== null}
      onClose={close}
    />
  );
}
