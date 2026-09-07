import { getSupabase } from '@/lib/supabase';
import type { EventType } from '@/types/models';
import type { CosmosEvent } from '@/types/database';
import type { DateKey } from '@/utils/date';

export interface EventInput {
  cosmosId: string;
  createdBy: string;
  title: string;
  date: DateKey;
  time?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  type?: EventType;
}

export async function createEvent(input: EventInput): Promise<CosmosEvent> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('events')
    .insert({
      cosmos_id: input.cosmosId,
      created_by: input.createdBy,
      title: input.title.trim(),
      date: input.date,
      time: input.time || null,
      location: input.location?.trim() || null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      description: input.description?.trim() || null,
      type: input.type ?? 'other',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateEvent(
  id: string,
  patch: Partial<Omit<EventInput, 'cosmosId' | 'createdBy'>>,
): Promise<void> {
  const supabase = getSupabase();
  const clean: Partial<CosmosEvent> = {};
  if (patch.title !== undefined) clean.title = patch.title.trim();
  if (patch.date !== undefined) clean.date = patch.date;
  if (patch.time !== undefined) clean.time = patch.time || null;
  if (patch.location !== undefined) clean.location = patch.location?.trim() || null;
  if (patch.latitude !== undefined) clean.latitude = patch.latitude ?? null;
  if (patch.longitude !== undefined) clean.longitude = patch.longitude ?? null;
  if (patch.description !== undefined) clean.description = patch.description?.trim() || null;
  if (patch.type !== undefined) clean.type = patch.type;
  const { error } = await supabase.from('events').update(clean).eq('id', id);
  if (error) throw error;
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}
