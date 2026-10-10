import { getSupabase } from '@/lib/supabase';
import type { Thought } from '@/types/database';

/** Send a "pensando en ti" pulse. Thoughts are immutable once sent. */
export async function sendThought(cosmosId: string, authorId: string): Promise<Thought> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('thoughts')
    .insert({ cosmos_id: cosmosId, author_id: authorId })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/** Recent thoughts for the cosmos (both people), newest first — enough to derive sincronías & streak. */
export async function recentThoughts(cosmosId: string, sinceDays = 90): Promise<Thought[]> {
  const supabase = getSupabase();
  const since = new Date(Date.now() - sinceDays * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from('thoughts')
    .select('*')
    .eq('cosmos_id', cosmosId)
    .gte('created_at', since)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
