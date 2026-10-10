import { getSupabase } from '@/lib/supabase';
import type { Comet } from '@/types/database';

export interface NewCometInput {
  cosmosId: string;
  authorId: string;
  recipientId: string;
  note?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
}

/** Send a comet to the other person. At least a note, an image or a link. */
export async function createComet(input: NewCometInput): Promise<Comet> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('comets')
    .insert({
      cosmos_id: input.cosmosId,
      author_id: input.authorId,
      recipient_id: input.recipientId,
      note: input.note?.trim() || null,
      image_url: input.imageUrl ?? null,
      link_url: input.linkUrl?.trim() || null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/** Mark a received comet as seen (idempotent; recipient only). */
export async function markCometSeen(id: string): Promise<Comet> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('mark_comet_seen', { p_id: id });
  if (error) throw error;
  return data as Comet;
}

/** All comets in the cosmos (sent & received), newest first. */
export async function listComets(cosmosId: string): Promise<Comet[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('comets')
    .select('*')
    .eq('cosmos_id', cosmosId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Comets waiting for me (unseen), oldest first — the ones that should unfold on open. */
export async function unseenForMe(cosmosId: string, userId: string): Promise<Comet[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('comets')
    .select('*')
    .eq('cosmos_id', cosmosId)
    .eq('recipient_id', userId)
    .is('seen_at', null)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function deleteComet(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('comets').delete().eq('id', id);
  if (error) throw error;
}
