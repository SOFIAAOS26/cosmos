import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import { NediScene } from '@/components/nedi';
import { TaskCard } from './TaskCard';
import { TaskDetail } from './TaskDetail';
import { TaskComposer } from './TaskComposer';
import { SupportSheet } from './SupportSheet';
import { CheckInDialog } from './CheckInDialog';
import { useDayRadar } from './useDayRadar';
import { setTaskCompleted, sendSupport, addCheckin } from './api';
import { useCosmos } from '@/providers/CosmosProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import type { DateKey } from '@/utils/date';
import type { Task } from '@/types/database';
import type { CheckinMood } from '@/types/models';

interface TaskRadarProps {
  dateKey: DateKey;
  /** Compact mode hides the section header (for embedding). */
  compact?: boolean;
  /** Header text. */
  label?: string;
}

/** The Task Radar for one day — tasks with support, reactions and check-ins. */
export function TaskRadar({ dateKey, compact, label = 'Radar del día' }: TaskRadarProps) {
  const { cosmos, members } = useCosmos();
  const { user } = useAuth();
  const toast = useToast();
  const { tasks, support, reactions, checkin, loading, refresh } = useDayRadar(dateKey);

  const [detail, setDetail] = useState<Task | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [supportTask, setSupportTask] = useState<Task | null>(null);
  const [checkinTask, setCheckinTask] = useState<Task | null>(null);

  const memberFor = useMemo(() => {
    const m = new Map(members.map((mem) => [mem.user_id, mem]));
    return (uid: string) => m.get(uid) ?? null;
  }, [members]);

  const sorted = useMemo(
    () => [...tasks].sort((a, b) => Number(a.completed) - Number(b.completed)),
    [tasks],
  );

  async function toggle(task: Task) {
    const next = !task.completed;
    try {
      await setTaskCompleted(task.id, next);
      await refresh();
      // Ask "¿Cómo te fue?" when finishing an important task of your own (§20).
      if (next && task.author_id === user?.id && task.priority !== 'normal') {
        setCheckinTask(task);
      }
    } catch {
      toast.error('No se pudo actualizar');
    }
  }

  async function onSend(message: string) {
    if (!cosmos || !user || !supportTask) return;
    try {
      await sendSupport({
        cosmosId: cosmos.id,
        taskId: supportTask.id,
        fromUser: user.id,
        toUser: supportTask.author_id,
        message,
      });
      toast.love('Apoyo enviado ♡');
      await refresh();
    } catch {
      toast.error('No se pudo enviar');
    }
  }

  async function onCheckin(mood: CheckinMood, note: string) {
    if (!cosmos || !user || !checkinTask) return;
    const partner = members.find((m) => m.user_id !== user.id);
    try {
      await addCheckin({
        cosmosId: cosmos.id,
        taskId: checkinTask.id,
        userId: user.id,
        partnerId: partner?.user_id ?? null,
        mood,
        note,
      });
      await refresh();
    } catch {
      toast.error('No se pudo guardar');
    }
  }

  if (!cosmos || !user) return null;

  return (
    <div>
      {!compact && (
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">{label}</h3>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setComposerOpen(true);
            }}
            className="inline-flex items-center gap-1 text-xs text-blossom hover:text-blossom-soft"
          >
            <Plus className="h-3.5 w-3.5" /> Pendiente
          </button>
        </div>
      )}

      {loading && tasks.length === 0 ? (
        <div className="space-y-2">
          <div className="h-14 animate-pulse rounded-xl bg-white/5" />
          <div className="h-14 animate-pulse rounded-xl bg-white/5" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-4">
          <NediScene state="idle" size={80} caption="Todo tranquilo por aquí." />
          <div className="mt-3 flex justify-center">
            <Button
              variant="subtle"
              size="sm"
              onClick={() => {
                setEditing(null);
                setComposerOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Agregar pendiente
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              author={memberFor(task.author_id)}
              support={support[task.id] ?? []}
              reactions={reactions[task.id] ?? []}
              checkin={checkin[task.id]}
              currentUserId={user.id}
              onOpen={() => setDetail(task)}
              onToggle={() => toggle(task)}
              onSupport={() => setSupportTask(task)}
            />
          ))}
        </div>
      )}

      {/* Detail */}
      <TaskDetail
        task={detail}
        open={detail !== null}
        support={detail ? support[detail.id] ?? [] : []}
        reactions={detail ? reactions[detail.id] ?? [] : []}
        checkin={detail ? checkin[detail.id] : undefined}
        onClose={() => setDetail(null)}
        onEdit={(t) => {
          setDetail(null);
          setEditing(t);
          setComposerOpen(true);
        }}
        onChanged={refresh}
      />

      {/* Composer */}
      <TaskComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        cosmosId={cosmos.id}
        authorId={user.id}
        date={dateKey}
        task={editing}
        onSaved={refresh}
      />

      {/* Support */}
      <SupportSheet
        open={supportTask !== null}
        onClose={() => setSupportTask(null)}
        toName={supportTask ? memberFor(supportTask.author_id)?.profile.display_name : undefined}
        onSend={onSend}
      />

      {/* Check-in */}
      <CheckInDialog
        open={checkinTask !== null}
        onClose={() => setCheckinTask(null)}
        onSubmit={onCheckin}
      />
    </div>
  );
}
