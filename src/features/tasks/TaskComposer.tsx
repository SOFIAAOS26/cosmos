import { useEffect, useState } from 'react';
import { BottomSheet, Button, Input, Textarea, Chip } from '@/components/ui';
import { useToast } from '@/providers/ToastProvider';
import { createTask, updateTask } from './api';
import { formatKey, type DateKey } from '@/utils/date';
import { TASK_PRIORITIES, TASK_CATEGORIES, type TaskPriority, type TaskCategory } from '@/types/models';
import type { Task } from '@/types/database';

interface TaskComposerProps {
  open: boolean;
  onClose: () => void;
  cosmosId: string;
  authorId: string;
  date: DateKey;
  task?: Task | null;
  onSaved?: () => void;
}

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  normal: 'Normal',
  important: 'Importante',
  high: 'Alta',
};

export function TaskComposer({ open, onClose, cosmosId, authorId, date, task, onSaved }: TaskComposerProps) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [category, setCategory] = useState<TaskCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? '');
    setDescription(task?.description ?? '');
    setPriority(task?.priority ?? 'normal');
    setCategory(task?.category ?? null);
    setError(null);
    setSaving(false);
  }, [open, task]);

  async function save() {
    if (saving) return;
    if (!title.trim()) {
      setError('Ponle un título.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (task) {
        await updateTask(task.id, { title, description: description.trim() || null, priority, category });
      } else {
        await createTask({ cosmosId, authorId, date, title, description, priority, category });
      }
      toast.success('Guardado en COSMOS');
      onSaved?.();
      onClose();
    } catch {
      setError('No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={task ? 'Editar pendiente' : 'Nuevo pendiente'}>
      <div className="space-y-5 py-2">
        <p className="text-xs uppercase tracking-widest text-ink-faint">{formatKey(date, "EEEE d 'de' MMMM")}</p>

        <Input
          label="¿Qué hay que hacer?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Examen de Cálculo…"
          autoFocus
        />

        <Textarea
          label="Detalles (opcional)"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-ink-soft">Prioridad</p>
          <div className="flex gap-2">
            {TASK_PRIORITIES.map((p) => (
              <Chip key={p} selected={priority === p} onClick={() => setPriority(p)}>
                {PRIORITY_LABEL[p]}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink-soft">Categoría</p>
          <div className="flex flex-wrap gap-2">
            {TASK_CATEGORIES.map((c) => (
              <Chip
                key={c}
                selected={category === c}
                onClick={() => setCategory(category === c ? null : c)}
              >
                {c}
              </Chip>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-blossom-soft">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button variant="subtle" fullWidth onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button fullWidth onClick={save} loading={saving}>
            Guardar
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
