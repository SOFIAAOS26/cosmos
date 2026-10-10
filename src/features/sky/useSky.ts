import { useCallback, useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useCosmos } from '@/providers/CosmosProvider';
import { useRealtimeTable } from '@/hooks/useRealtime';
import { findSincronias } from '@/features/thinking/sincronia';
import { buildStars, type SkyStar } from './stars';
import { listConstellations } from './api';
import type { Constellation, Thought } from '@/types/database';

export interface SkyData {
  stars: SkyStar[];
  constellations: Constellation[];
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * The living sky (§Hito8-D): stars derived from every interaction, plus the
 * saved constellations. Stars are read once per visit (a reflective space, not
 * a live feed); constellations stay live so both can draw together.
 */
export function useSky(): SkyData {
  const { cosmos } = useCosmos();
  const [stars, setStars] = useState<SkyStar[]>([]);
  const [constellations, setConstellations] = useState<Constellation[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!cosmos) return;
    const supabase = getSupabase();
    try {
      const [mem, pap, com, eve, not, tho, con] = await Promise.all([
        supabase.from('memories').select('*').eq('cosmos_id', cosmos.id),
        supabase.from('memory_papers').select('*').eq('cosmos_id', cosmos.id),
        supabase.from('comets').select('*').eq('cosmos_id', cosmos.id),
        supabase.from('events').select('*').eq('cosmos_id', cosmos.id),
        supabase.from('notes').select('*').eq('cosmos_id', cosmos.id),
        supabase.from('thoughts').select('*').eq('cosmos_id', cosmos.id),
        listConstellations(cosmos.id),
      ]);
      const sincronias = findSincronias((tho.data ?? []) as Thought[]);
      setStars(
        buildStars({
          memories: mem.data ?? [],
          papers: pap.data ?? [],
          comets: com.data ?? [],
          events: eve.data ?? [],
          notes: not.data ?? [],
          sincronias,
        }),
      );
      setConstellations(con);
    } finally {
      setLoading(false);
    }
  }, [cosmos?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Constellations stay live so a line drawn on one phone appears on the other.
  useRealtimeTable('constellations', cosmos?.id, () => {
    if (!cosmos) return;
    listConstellations(cosmos.id)
      .then(setConstellations)
      .catch(() => {});
  });

  return { stars, constellations, loading, refresh };
}
