import { useMemo, useState } from 'react';
import { Plus, MapPin, Clock, Check } from 'lucide-react';
import { BottomSheet, Button, Divider, Input, Badge } from '@/components/ui';
import { NediScene } from '@/components/nedi';
import { cn } from '@/utils/cn';
import { formatKey, todayKey, type DateKey } from '@/utils/date';
import { useDay } from '@/features/day/useDay';
import { useCosmos } from '@/providers/CosmosProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { createTask, setTaskCompleted } from '@/features/tasks/api';
import { identityOf } from '@/theme/identity';
import type { Task } from '@/types/database';

interface DaySheetProps {
  dateKey: DateKey | null;
  open: boolean;
  onClose: () => void;
}

const PRIORITY_TONE = { normal: 'neutral', important: 'blossom', high: 'high' } as const;

export function DaySheet({ dateKey, open, onClose }: DaySheetProps) {
  const { cosmos, members } = useCosmos();
  const { user } = useAuth();
  const toast = useToast();
  const { memory, tasks, events, loading, refresh } = useDay(open ? dateKey : null);
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const isToday = dateKey === todayKey(cosmos?.timezone ?? 'UTC');
  const title = dateKey ? formatKey(dateKey, "EEEE d 'de' MMMM") : '';

  const nameFor = useMemo(() => {
    const m = new Map(members.map((mem) => [mem.user_id, mem]));
    return (id: string) => m.get(id) ?? null;
  }, [members]);

  async function toggle(task: Task) {
    try {
      await setTaskCompleted(task.id, !task.completed);
      await refresh();
    } catch {
      toast.error('No se pudo actualizar');
    }
  }

  async function addTask() {
    if (!cosmos || !user || !dateKey || !newTitle.trim() || adding) return;
    setAdding(true);
    try {
      await createTask({ cosmosId: cosmos.id, authorId: user.id, date: dateKey, title: newTitle });
      setNewTitle('');
      await refresh();
      toast.success('Guardado en COSMOS');
    } catch {
      toast.error('No se pudo guardar');
    } finally {
      setAdding(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={<span className="capitalize">{title}</span>}>
      {loading ? (
        <div className="space-y-3 py-6">
          <div className="h-20 animate-pulse rounded-xl bg-white/5" />
          <div className="h-12 animate-pulse rounded-xl bg-white/5" />
        </div>
      ) : (
        <div className="space-y-6 py-2">
          {/* MOMENTS & PLANS */}
          <section>
            <SectionTitle>Momento del día</SectionTitle>
            {memory ? (
              <div className="overflow-hidden rounded-xl border border-white/5 bg-surface">
                {memory.photo_url ? (
                  <img src={memory.photo_url} alt="" className="max-h-64 w-full object-cover" />
                ) : null}
                {memory.story && (
                  <p className="p-4 text-sm leading-relaxed text-ink">{memory.story}</p>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 py-6">
                <NediScene state="idle" size={92} caption="Todavía no hay un recuerdo aquí." />
              </div>
            )}
          </section>

          <Divider label="Radar del día" />

          {/* TODAY'S RADAR — tasks */}
          <section className="space-y-2">
            {tasks.length === 0 ? (
              <p className="py-2 text-center text-sm text-ink-faint">Todo tranquilo por aquí.</p>
            ) : (
              tasks.map((task) => {
                const member = nameFor(task.author_id);
                const id = identityOf(member?.identity);
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-surface px-3 py-2.5"
                  >
                    <button
                      type="button"
                      onClick={() => toggle(task)}
                      aria-label={task.completed ? 'Marcar pendiente' : 'Completar'}
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors',
                        task.completed
                          ? 'border-transparent bg-aura/80 text-void'
                          : 'border-white/25 text-transparent hover:border-white/50',
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={cn('truncate text-sm', task.completed && 'text-ink-faint line-through')}>
                        {task.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className={cn('text-[11px]', id.text)}>{member?.profile.display_name ?? '—'}</span>
                        {task.category && <span className="text-[11px] text-ink-faint">· {task.category}</span>}
                      </div>
                    </div>
                    {task.priority !== 'normal' && (
                      <Badge tone={PRIORITY_TONE[task.priority]}>
                        {task.priority === 'high' ? 'Alta' : 'Importante'}
                      </Badge>
                    )}
                  </div>
                );
              })
            )}

            {/* quick add */}
            <div className="flex items-center gap-2 pt-1">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={isToday ? 'Agregar pendiente de hoy…' : 'Agregar pendiente…'}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
              <Button
                variant="subtle"
                size="md"
                onClick={addTask}
                loading={adding}
                disabled={!newTitle.trim()}
                aria-label="Agregar"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </section>

          {/* Events */}
          {events.length > 0 && (
            <section>
              <SectionTitle>Eventos</SectionTitle>
              <div className="space-y-2">
                {events.map((ev) => (
                  <div key={ev.id} className="rounded-xl border border-white/5 bg-surface px-3 py-2.5">
                    <p className="text-sm text-ink">{ev.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-ink-faint">
                      {ev.time && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {ev.time}
                        </span>
                      )}
                      {ev.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {ev.location}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </BottomSheet>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-faint">{children}</h3>;
}
