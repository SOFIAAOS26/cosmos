import { getSupabase } from '@/lib/supabase';
import { createEvent } from '@/features/events/api';
import type { DateKey } from '@/utils/date';
import type { BucketItem } from '@/types/database';

export async function createBucketItem(params: {
  cosmosId: string;
  createdBy: string;
  title: string;
  description?: string;
}): Promise<BucketItem> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('bucket_items')
    .insert({
      cosmos_id: params.cosmosId,
      created_by: params.createdBy,
      title: params.title.trim(),
      description: params.description?.trim() || null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function setBucketCompleted(id: string, completed: boolean): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('bucket_items')
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteBucketItem(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('bucket_items').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Schedule a bucket idea onto the calendar (§23): stamp its date and create an
 * event so it shows up in the shared timeline.
 */
export async function scheduleBucketItem(params: {
  item: BucketItem;
  createdBy: string;
  date: DateKey;
}): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('bucket_items')
    .update({ scheduled_date: params.date })
    .eq('id', params.item.id);
  if (error) throw error;

  await createEvent({
    cosmosId: params.item.cosmos_id,
    createdBy: params.createdBy,
    title: params.item.title,
    date: params.date,
    type: 'experience',
    description: params.item.description ?? undefined,
  });
}
