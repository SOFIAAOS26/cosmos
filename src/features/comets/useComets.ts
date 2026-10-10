import { useCallback, useEffect, useState } from 'react';
import { useCosmos } from '@/providers/CosmosProvider';
import { useRealtimeTable } from '@/hooks/useRealtime';
import { listComets } from './api';
import type { Comet } from '@/types/database';

/** All comets in the cosmos (sent & received), kept live. */
export function useComets() {
  const { cosmos } = useCosmos();
  const [comets, setComets] = useState<Comet[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!cosmos) return;
    try {
      setComets(await listComets(cosmos.id));
    } finally {
      setLoading(false);
    }
  }, [cosmos?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useRealtimeTable('comets', cosmos?.id, () => {
    void refresh();
  });

  return { comets, loading, refresh };
}
