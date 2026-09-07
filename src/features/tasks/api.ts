import { getSupabase } from '@/lib/supabase';
import type { TaskCategory, TaskPriority } from '@/types/models';
import type { DateKey } from '@/utils/date';

export interface NewTaskInput {
  cosmosId: string;
  authorId: string;
  date: DateKey;
  title: string;
  description?: string;
  priority?: TaskPriority;
  category?: TaskCategory;
}

export async function createTask(input: NewTaskInput) {
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

export async function setTaskCompleted(taskId: string, completed: boolean) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('tasks')
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq('id', taskId);
  if (error) throw error;
}

export async function deleteTask(taskId: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) throw error;
}
