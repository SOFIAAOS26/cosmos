import { getSupabase } from '@/lib/supabase';

/**
 * Set (or replace) the cosmos's primary "next adventure" countdown (§24).
 * There is a unique index enforcing one primary per cosmos, so we update the
 * existing primary in place when present, otherwise insert a new one.
 */
export async function setPrimaryCountdown(params: {
  cosmosId: string;
  createdBy: string;
  title: string;
  targetIso: string;
  eventId?: string | null;
}): Promise<void> {
  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from('countdowns')
    .select('id')
    .eq('cosmos_id', params.cosmosId)
    .eq('is_primary', true)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('countdowns')
      .update({
        title: params.title.trim(),
        target_date: params.targetIso,
        event_id: params.eventId ?? null,
      })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('countdowns').insert({
      cosmos_id: params.cosmosId,
      created_by: params.createdBy,
      title: params.title.trim(),
      target_date: params.targetIso,
      event_id: params.eventId ?? null,
      is_primary: true,
    });
    if (error) throw error;
  }
}

export async function clearPrimaryCountdown(cosmosId: string): Promise<void> {
  const supabase = getSupabase();
  await supabase.from('countdowns').delete().eq('cosmos_id', cosmosId).eq('is_primary', true);
}
