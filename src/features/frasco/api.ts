import { getSupabase } from '@/lib/supabase';
import type { MemoryPaper } from '@/types/database';
import type { PaperColor, PaperIntention } from '@/types/models';

// Pure selection helper lives in frascoLayout (no Supabase import) and is
// re-exported here so callers can keep importing it from the feature's api.
export { pickPaper } from './frascoLayout';

export interface NewPaperInput {
  cosmosId: string;
  authorId: string;
  message: string;
  color: PaperColor;
  intention: PaperIntention;
  imageUrl?: string | null;
  recipientId?: string | null;
  isSecret?: boolean;
}

export async function createPaper(input: NewPaperInput): Promise<MemoryPaper> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('memory_papers')
    .insert({
      cosmos_id: input.cosmosId,
      author_id: input.authorId,
      message: input.message.trim(),
      color: input.color,
      intention: input.intention,
      image_url: input.imageUrl ?? null,
      recipient_id: input.recipientId ?? null,
      is_secret: input.isSecret ?? input.intention === 'secret',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/** Open a paper — bumps opened_count / last_opened_at and returns the fresh row. */
export async function openPaper(id: string): Promise<MemoryPaper> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('open_memory_paper', { p_id: id });
  if (error) throw error;
  return data as MemoryPaper;
}

export async function deletePaper(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('memory_papers').delete().eq('id', id);
  if (error) throw error;
}
