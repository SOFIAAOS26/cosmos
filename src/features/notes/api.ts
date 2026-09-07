import { getSupabase } from '@/lib/supabase';
import type { NoteKind } from '@/types/models';
import type { Note } from '@/types/database';

export interface NewNoteInput {
  cosmosId: string;
  authorId: string;
  recipientId?: string | null;
  kind: NoteKind;
  title?: string;
  body: string;
  /** ISO instant for scheduled notes. */
  unlockAt?: string | null;
}

export async function createNote(input: NewNoteInput): Promise<Note> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('notes')
    .insert({
      cosmos_id: input.cosmosId,
      author_id: input.authorId,
      recipient_id: input.recipientId ?? null,
      kind: input.kind,
      title: input.title?.trim() || null,
      body: input.body.trim(),
      unlock_at: input.kind === 'scheduled' ? input.unlockAt ?? null : null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/** Mark a sealed note as opened (§20) — the "scratch/open" reveal, not security. */
export async function openNote(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('notes')
    .update({ opened_at: new Date().toISOString() })
    .eq('id', id)
    .is('opened_at', null);
  if (error) throw error;
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}

/** Can the given viewer see this note's content yet? */
export function noteUnlocked(note: Note, viewerId: string): boolean {
  if (note.author_id === viewerId) return true; // authors always see their own
  if (note.kind === 'immediate') return true;
  if (note.kind === 'scheduled') return !note.unlock_at || Date.parse(note.unlock_at) <= Date.now();
  if (note.kind === 'sealed') return !!note.opened_at;
  return true;
}
