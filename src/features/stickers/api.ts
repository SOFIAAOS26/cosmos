import { getSupabase } from '@/lib/supabase';
import type { Sticker, MemorySticker } from '@/types/database';

/** A sticker url is either an emoji token ("emoji:❤️") or an image URL. */
export function isEmojiSticker(url: string): boolean {
  return url.startsWith('emoji:');
}
export function stickerEmoji(url: string): string {
  return url.startsWith('emoji:') ? url.slice('emoji:'.length) : '';
}

export async function listGlobalStickers(): Promise<Sticker[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('stickers')
    .select('*')
    .eq('is_global', true)
    .order('created_at', { ascending: true });
  return data ?? [];
}

export async function listMemoryStickers(memoryId: string): Promise<MemorySticker[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('memory_stickers')
    .select('*')
    .eq('memory_id', memoryId)
    .order('z', { ascending: true });
  return data ?? [];
}

export async function addMemorySticker(params: {
  cosmosId: string;
  memoryId: string;
  stickerId: string;
  z: number;
}): Promise<MemorySticker> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('memory_stickers')
    .insert({
      cosmos_id: params.cosmosId,
      memory_id: params.memoryId,
      sticker_id: params.stickerId,
      x: 0.5,
      y: 0.5,
      scale: 1,
      rotation: 0,
      z: params.z,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateMemorySticker(
  id: string,
  patch: Partial<Pick<MemorySticker, 'x' | 'y' | 'scale' | 'rotation' | 'z'>>,
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('memory_stickers').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteMemorySticker(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('memory_stickers').delete().eq('id', id);
  if (error) throw error;
}
