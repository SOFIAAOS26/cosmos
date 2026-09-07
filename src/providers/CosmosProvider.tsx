import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import type { Cosmos, CosmosMember, Profile } from '@/types/database';
import type { Identity } from '@/theme/identity';

export interface MemberWithProfile extends CosmosMember {
  profile: Profile;
}

interface CosmosApi {
  cosmos: Cosmos | null;
  members: MemberWithProfile[];
  me: MemberWithProfile | null;
  partner: MemberWithProfile | null;
  /** True once we've resolved whether the user belongs to a cosmos. */
  loaded: boolean;
  refresh: () => Promise<void>;
  createCosmos: (name: string, identity: Identity, timezone: string) => Promise<string>;
  joinCosmos: (code: string, identity: Identity) => Promise<string>;
}

const CosmosContext = createContext<CosmosApi | null>(null);

export function CosmosProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabase();
  const { user, profile } = useAuth();
  const [cosmos, setCosmos] = useState<Cosmos | null>(null);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setCosmos(null);
      setMembers([]);
      setLoaded(true);
      return;
    }
    // Which cosmos do I belong to? (MVP: at most one)
    const { data: mine, error: mineErr } = await supabase
      .from('cosmos_members')
      .select('cosmos_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (mineErr) console.error('[COSMOS] membership lookup', mineErr);

    if (!mine) {
      setCosmos(null);
      setMembers([]);
      setLoaded(true);
      return;
    }

    const [{ data: cosmosRow }, { data: memberRows }] = await Promise.all([
      supabase.from('cosmos').select('*').eq('id', mine.cosmos_id).single(),
      supabase
        .from('cosmos_members')
        .select('*, profile:profiles(*)')
        .eq('cosmos_id', mine.cosmos_id)
        .order('joined_at', { ascending: true }),
    ]);

    setCosmos(cosmosRow ?? null);
    setMembers((memberRows as MemberWithProfile[] | null) ?? []);
    setLoaded(true);
  }, [supabase, user]);

  useEffect(() => {
    setLoaded(false);
    void load();
  }, [load, profile]);

  const createCosmos = useCallback(
    async (name: string, identity: Identity, timezone: string) => {
      const { data, error } = await supabase.rpc('create_cosmos', {
        p_name: name,
        p_identity: identity,
        p_timezone: timezone,
      });
      if (error) throw error;
      await load();
      return data as string;
    },
    [supabase, load],
  );

  const joinCosmos = useCallback(
    async (code: string, identity: Identity) => {
      const { data, error } = await supabase.rpc('accept_invite', {
        p_code: code.trim().toUpperCase(),
        p_identity: identity,
      });
      if (error) throw error;
      await load();
      return data as string;
    },
    [supabase, load],
  );

  const me = useMemo(
    () => members.find((m) => m.user_id === user?.id) ?? null,
    [members, user],
  );
  const partner = useMemo(
    () => members.find((m) => m.user_id !== user?.id) ?? null,
    [members, user],
  );

  const value = useMemo<CosmosApi>(
    () => ({ cosmos, members, me, partner, loaded, refresh: load, createCosmos, joinCosmos }),
    [cosmos, members, me, partner, loaded, load, createCosmos, joinCosmos],
  );

  return <CosmosContext.Provider value={value}>{children}</CosmosContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCosmos(): CosmosApi {
  const ctx = useContext(CosmosContext);
  if (!ctx) throw new Error('useCosmos must be used within <CosmosProvider>');
  return ctx;
}
