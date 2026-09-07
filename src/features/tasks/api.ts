import { getSupabase } from '@/lib/supabase';
import type { TaskCategory, TaskPriority, CheckinMood } from '@/types/models';
import type { DateKey } from '@/utils/date';
import type { Task } from '@/types/database';

export interface NewTaskInput {
  cosmosId: string;
  authorId: string;
  date: DateKey;
  title: string;
  description?: string;
  priority?: TaskPriority;
  category?: TaskCategory | null;
}

export async function createTask(input: NewTaskInput): Promise<Task> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      cosmos_id: input.cosmosId,
      author_id: input.authorId,
      date: input.date,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      priority: input.priority ?? 'normal',
      category: input.category ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateTask(
  id: string,
  patch: {
    title?: string;
    description?: string | null;
    priority?: TaskPriority;
    category?: TaskCategory | null;
    date?: DateKey;
  },
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('tasks').update(patch).eq('id', id);
  if (error) throw error;
}

export async function setTaskCompleted(taskId: string, completed: boolean): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('tasks')
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq('id', taskId);
  if (error) throw error;
}

export async function deleteTask(taskId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) throw error;
}

/* ------------------------------- Support ------------------------------- */

/** Best-effort notification insert; never blocks the primary action. */
async function notify(
  cosmosId: string,
  userId: string,
  type: 'support_received' | 'task_completed' | 'checkin_received',
  payload: Record<string, string | number | null>,
): Promise<void> {
  try {
    const supabase = getSupabase();
    await supabase.from('notifications').insert({ cosmos_id: cosmosId, user_id: userId, type, payload });
  } catch {
    /* notifications are non-critical */
  }
}

export async function sendSupport(params: {
  cosmosId: string;
  taskId: string;
  fromUser: string;
  toUser: string;
  message: string;
}): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('task_support').insert({
    cosmos_id: params.cosmosId,
    task_id: params.taskId,
    from_user: params.fromUser,
    message: params.message.trim(),
  });
  if (error) throw error;
  if (params.toUser && params.toUser !== params.fromUser) {
    await notify(params.cosmosId, params.toUser, 'support_received', {
      task_id: params.taskId,
      from: params.fromUser,
      message: params.message.trim(),
    });
  }
}

/* ------------------------------ Reactions ------------------------------ */

export async function toggleReaction(params: {
  cosmosId: string;
  taskId: string;
  fromUser: string;
  emoji: string;
  existingId?: string | null;
}): Promise<void> {
  const supabase = getSupabase();
  if (params.existingId) {
    const { error } = await supabase.from('task_reactions').delete().eq('id', params.existingId);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from('task_reactions').insert({
    cosmos_id: params.cosmosId,
    task_id: params.taskId,
    from_user: params.fromUser,
    emoji: params.emoji,
  });
  if (error) throw error;
}

/* ------------------------------- Check-in ------------------------------ */

export async function addCheckin(params: {
  cosmosId: string;
  taskId: string;
  userId: string;
  partnerId?: string | null;
  mood: CheckinMood;
  note?: string;
}): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('task_checkins').insert({
    cosmos_id: params.cosmosId,
    task_id: params.taskId,
    user_id: params.userId,
    mood: params.mood,
    note: params.note?.trim() || null,
  });
  if (error) throw error;
  if (params.partnerId) {
    await notify(params.cosmosId, params.partnerId, 'checkin_received', {
      task_id: params.taskId,
      mood: params.mood,
    });
  }
}
