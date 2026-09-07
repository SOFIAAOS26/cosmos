import { useState } from 'react';
import { Pencil, Trash2, Heart } from 'lucide-react';
import { BottomSheet, Button, Badge, ConfirmDialog, Divider } from '@/components/ui';
import { cn } from '@/utils/cn';
import { SupportSheet } from './SupportSheet';
import { deleteTask, toggleReaction, sendSupport } from './api';
import { useCosmos } from '@/providers/CosmosProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { identityOf } from '@/theme/identity';
import { CHECKIN_MOODS } from '@/types/models';
import type { Task, TaskSupport, TaskReaction, TaskCheckin } from '@/types/database';

const REACTIONS = ['❤️', '🔥', '👏', '🥹', '✨', '💪'];
const PRIORITY_TONE = { normal: 'neutral', important: 'blossom', high: 'high' } as const;

interface TaskDetailProps {
  task: Task | null;
  support: TaskSupport[];
  reactions: TaskReaction[];
  checkin?: TaskCheckin;
  open: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onChanged: () => void;
}

export function TaskDetail({
  task,
  support,
  reactions,
  checkin,
  open,
  onClose,
  onEdit,
  onChanged,
}: TaskDetailProps) {
  const { cosmos, members } = useCosmos();
  const { user } = useAuth();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  if (!task) return null;

  const author = members.find((m) => m.user_id === task.author_id) ?? null;
  const id = identityOf(author?.identity);
  const isMine = task.author_id === user?.id;
  const mood = checkin ? CHECKIN_MOODS.find((m) => m.key === checkin.mood) : null;

  async function react(emoji: string) {
    if (!cosmos || !user || !task) return;
    const existing = reactions.find((r) => r.from_user === user.id && r.emoji === emoji);
    try {
      await toggleReaction({
        cosmosId: cosmos.id,
        taskId: task.id,
        fromUser: user.id,
        emoji,
        existingId: existing?.id ?? null,
      });
      onChanged();
    } catch {
      toast.error('No se pudo reaccionar');
    }
  }

  async function onSendSupport(message: string) {
    if (!cosmos || !user || !task) return;
    try {
      await sendSupport({
        cosmosId: cosmos.id,
        taskId: task.id,
        fromUser: user.id,
        toUser: task.author_id,
        message,
      });
      toast.love('Apoyo enviado ♡');
      onChanged();
    } catch {
      toast.error('No se pudo enviar');
    }
  }

  async function onConfirmDelete() {
    if (!task) return;
    setDeleting(true);
    try {
      await deleteTask(task.id);
      toast.success('Eliminado');
      setConfirm(false);
      onChanged();
      onClose();
    } catch {
      toast.error('No se pudo eliminar');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title={task.title}>
        <div className="space-y-5 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('text-sm', id.text)}>{author?.profile.display_name ?? '—'}</span>
            {task.category && <Badge>{task.category}</Badge>}
            {task.priority !== 'normal' && (
              <Badge tone={PRIORITY_TONE[task.priority]}>
                {task.priority === 'high' ? 'Alta' : 'Importante'}
              </Badge>
            )}
            {task.completed && <Badge tone="aura">Completada</Badge>}
          </div>

          {task.description && (
            <p className="text-sm leading-relaxed text-ink-soft">{task.description}</p>
          )}

          {mood && (
            <div className="rounded-xl border border-white/5 bg-surface p-3 text-sm">
              <span className="text-lg">{mood.emoji}</span>{' '}
              <span className="text-ink">{mood.label}</span>
              {checkin?.note && <span className="text-ink-faint"> · {checkin.note}</span>}
            </div>
          )}

          {/* Reactions */}
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-ink-faint">Reacciones</p>
            <div className="flex flex-wrap gap-2">
              {REACTIONS.map((emoji) => {
                const mine = reactions.some((r) => r.from_user === user?.id && r.emoji === emoji);
                const count = reactions.filter((r) => r.emoji === emoji).length;
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => react(emoji)}
                    className={cn(
                      'flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-colors',
                      mine ? 'border-blossom/40 bg-blossom/10' : 'border-white/10 hover:bg-white/5',
                    )}
                  >
                    <span>{emoji}</span>
                    {count > 0 && <span className="text-xs text-ink-faint">{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Support thread */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-ink-faint">Apoyo</p>
              {!isMine && !task.completed && (
                <button
                  type="button"
                  onClick={() => setSupportOpen(true)}
                  className="inline-flex items-center gap-1 text-xs text-blossom hover:text-blossom-soft"
                >
                  <Heart className="h-3.5 w-3.5" /> Mandar apoyo
                </button>
              )}
            </div>
            {support.length === 0 ? (
              <p className="text-sm text-ink-faint">Aún no hay mensajes de apoyo.</p>
            ) : (
              <div className="space-y-2">
                {support.map((s) => {
                  const from = members.find((m) => m.user_id === s.from_user);
                  const fid = identityOf(from?.identity);
                  return (
                    <div key={s.id} className="rounded-xl border border-blossom/15 bg-blossom/5 px-3 py-2">
                      <p className="text-sm text-ink">{s.message}</p>
                      <p className={cn('mt-0.5 text-[11px]', fid.text)}>
                        {from?.profile.display_name ?? 'Alguien'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Owner actions */}
          {isMine && (
            <>
              <Divider />
              <div className="flex gap-3">
                <Button variant="subtle" fullWidth onClick={() => onEdit(task)}>
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                <Button variant="danger" onClick={() => setConfirm(true)} aria-label="Eliminar">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </BottomSheet>

      <SupportSheet
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
        toName={author?.profile.display_name}
        onSend={onSendSupport}
      />

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={onConfirmDelete}
        loading={deleting}
        tone="danger"
        title="¿Borrar este pendiente?"
        confirmLabel="Borrar"
      />
    </>
  );
}
