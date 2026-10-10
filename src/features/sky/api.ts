import { getSupabase } from '@/lib/supabase';
import type { Constellation } from '@/types/database';

export async function listConstellations(cosmosId: string): Promise<Constellation[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('constellations')
    .select('*')
    .eq('cosmos_id', cosmosId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export interface NewConstellationInput {
  cosmosId: string;
  authorId: string;
  name: string;
  stars: string[];
}

export async function createConstellation(input: NewConstellationInput): Promise<Constellation> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('constellations')
    .insert({
      cosmos_id: input.cosmosId,
      author_id: input.authorId,
      name: input.name.trim(),
      stars: input.stars,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteConstellation(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('constellations').delete().eq('id', id);
  if (error) throw error;
}
