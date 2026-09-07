import { getSupabase } from '@/lib/supabase';
import { deletePhoto } from '@/features/media/storage';
import { parseSongUrl } from './soundtrack';
import type { Memory, Song } from '@/types/database';
import type { DateKey } from '@/utils/date';

export interface SaveMemoryInput {
  cosmosId: string;
  authorId: string;
  date: DateKey;
  story?: string;
  /** Storage path (from uploadPhoto), not a URL. */
  photoPath?: string | null;
}

export async function createMemory(input: SaveMemoryInput): Promise<Memory> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('memories')
    .insert({
      cosmos_id: input.cosmosId,
      author_id: input.authorId,
      date: input.date,
      story: input.story?.trim() || null,
      photo_url: input.photoPath ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateMemory(
  id: string,
  patch: { story?: string | null; photo_url?: string | null; date?: DateKey },
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('memories').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteMemory(memory: Memory): Promise<void> {
  const supabase = getSupabase();
  // Best-effort: remove the photo object, then the row (media/songs cascade).
  if (memory.photo_url) await deletePhoto(memory.photo_url).catch(() => undefined);
  const { error } = await supabase.from('memories').delete().eq('id', memory.id);
  if (error) throw error;
}

/* -------------------------------- Songs -------------------------------- */

export async function getSongForMemory(memoryId: string): Promise<Song | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('songs')
    .select('*')
    .eq('memory_id', memoryId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

export async function setMemorySong(params: {
  cosmosId: string;
  memoryId: string;
  url: string;
  title?: string;
  artist?: string;
}): Promise<Song | null> {
  const parsed = parseSongUrl(params.url);
  if (!parsed) throw new Error('No reconocí ese enlace. Usa Spotify o YouTube.');
  const supabase = getSupabase();

  // One song per memory: clear previous, then insert.
  await supabase.from('songs').delete().eq('memory_id', params.memoryId);
  const { data, error } = await supabase
    .from('songs')
    .insert({
      cosmos_id: params.cosmosId,
      memory_id: params.memoryId,
      platform: parsed.platform,
      url: parsed.url,
      title: params.title?.trim() || null,
      artist: params.artist?.trim() || null,
      thumbnail: parsed.thumbnail,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function removeMemorySong(memoryId: string): Promise<void> {
  const supabase = getSupabase();
  await supabase.from('songs').delete().eq('memory_id', memoryId);
}
