import { getSupabase } from '@/lib/supabase';
import type { Notification } from '@/types/database';

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = getSupabase();
  await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
}

export async function markAllRead(userId: string): Promise<void> {
  const supabase = getSupabase();
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);
}

/** Human, on-brand text for a notification (§43, §64). */
export function notificationText(n: Notification): { emoji: string; text: string } {
  const payload = (typeof n.payload === 'object' && n.payload) || {};
  const message = (payload as Record<string, unknown>).message;
  switch (n.type) {
    case 'support_received':
      return { emoji: '💌', text: typeof message === 'string' ? message : 'Recibiste apoyo' };
    case 'task_completed':
      return { emoji: '✅', text: 'Se completó un pendiente' };
    case 'checkin_received':
      return { emoji: '✨', text: 'Compartió cómo le fue' };
    case 'note_unlocked':
      return { emoji: '✉️', text: 'Se abrió una nota' };
    case 'event_upcoming':
      return { emoji: '🎟️', text: 'Se acerca un evento' };
    default:
      return { emoji: '•', text: 'Novedad' };
  }
}
