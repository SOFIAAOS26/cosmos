import { useCallback, useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useCosmos } from '@/providers/CosmosProvider';
import { useAuth } from '@/providers/AuthProvider';

/**
 * Ensures there's an invite code to share with the second person (§31).
 * Reuses a pending invite if one exists, otherwise creates one.
 */
export function useInvite(enabled: boolean): { code: string | null; loading: boolean } {
  const { cosmos } = useCosmos();
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ensure = useCallback(async () => {
    if (!cosmos || !user) return;
    setLoading(true);
    const supabase = getSupabase();
    const { data: existing } = await supabase
      .from('cosmos_invites')
      .select('code, accepted_at')
      .eq('cosmos_id', cosmos.id)
      .is('accepted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.code) {
      setCode(existing.code);
      setLoading(false);
      return;
    }

    const { data: created, error } = await supabase
      .from('cosmos_invites')
      .insert({ cosmos_id: cosmos.id, created_by: user.id })
      .select('code')
      .single();
    if (!error && created) setCode(created.code);
    setLoading(false);
  }, [cosmos, user]);

  useEffect(() => {
    if (enabled) void ensure();
  }, [enabled, ensure]);

  return { code, loading };
}
