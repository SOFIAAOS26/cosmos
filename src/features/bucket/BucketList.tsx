import { useState } from 'react';
import { Plus, Check, CalendarPlus, Trash2 } from 'lucide-react';
import { GlassCard, Input, Button, Modal } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useBucket } from './useBucket';
import { createBucketItem, setBucketCompleted, deleteBucketItem, scheduleBucketItem } from './api';
import { useCosmos } from '@/providers/CosmosProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { todayKey } from '@/utils/date';
import type { BucketItem } from '@/types/database';

export function BucketList() {
  const { cosmos } = useCosmos();
  const { user } = useAuth();
  const toast = useToast();
  const { items, refresh } = useBucket();
  const [title, setTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [scheduling, setScheduling] = useState<BucketItem | null>(null);
  const [schedDate, setSchedDate] = useState('');

  async function add() {
    if (!cosmos || !user || !title.trim() || adding) return;
    setAdding(true);
    try {
      await createBucketItem({ cosmosId: cosmos.id, createdBy: user.id, title });
      setTitle('');
      await refresh();
    } catch {
      toast.error('No se pudo agregar');
    } finally {
      setAdding(false);
    }
  }

  async function toggle(item: BucketItem) {
    try {
      await setBucketCompleted(item.id, !item.completed);
      await refresh();
    } catch {
      toast.error('No se pudo actualizar');
    }
  }

  async function remove(item: BucketItem) {
    try {
      await deleteBucketItem(item.id);
      await refresh();
    } catch {
      toast.error('No se pudo eliminar');
    }
  }

  async function confirmSchedule() {
    if (!user || !scheduling || !schedDate) return;
    try {
      await scheduleBucketItem({ item: scheduling, createdBy: user.id, date: schedDate });
      toast.love('Agendado en el calendario ✨');
      setScheduling(null);
      setSchedDate('');
      await refresh();
    } catch {
      toast.error('No se pudo agendar');
    }
  }

  return (
    <GlassCard padded>
      <p className="mb-3 text-xs uppercase tracking-widest text-ink-faint">Bucket list</p>

      <div className="mb-3 flex items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Algo que queremos vivir…"
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <Button variant="subtle" onClick={add} loading={adding} disabled={!title.trim()} aria-label="Agregar">
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="py-2 text-center text-sm text-ink-faint">Sueñen en grande. Agreguen la primera idea.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.id} className="group flex items-center gap-3 rounded-lg px-1 py-1.5">
              <button
                type="button"
                onClick={() => toggle(item)}
                aria-label={item.completed ? 'Marcar pendiente' : 'Completar'}
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                  item.completed
                    ? 'border-transparent bg-aura/80 text-void'
                    : 'border-white/25 text-transparent hover:border-white/50',
                )}
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <span className={cn('flex-1 text-sm', item.completed && 'text-ink-faint line-through')}>
                {item.title}
              </span>
              {item.scheduled_date && !item.completed && (
                <span className="text-[10px] text-aura">agendado</span>
              )}
              {!item.completed && (
                <button
                  type="button"
                  onClick={() => setScheduling(item)}
                  aria-label="Agendar"
                  className="text-ink-faint hover:text-blossom"
                >
                  <CalendarPlus className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(item)}
                aria-label="Eliminar"
                className="text-ink-faint opacity-0 transition-opacity hover:text-blossom-soft group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={scheduling !== null} onClose={() => setScheduling(null)} title="Agendar en el calendario">
        <p className="mb-4 text-sm text-ink-soft">
          Llevaremos “{scheduling?.title}” al calendario como una experiencia.
        </p>
        <Input type="date" value={schedDate} onChange={(e) => setSchedDate(e.target.value)} min={cosmos ? todayKey(cosmos.timezone) : undefined} />
        <div className="mt-5 flex gap-3">
          <Button variant="subtle" fullWidth onClick={() => setScheduling(null)}>
            Cancelar
          </Button>
          <Button variant="blossom" fullWidth onClick={confirmSchedule} disabled={!schedDate}>
            Agendar
          </Button>
        </div>
      </Modal>
    </GlassCard>
  );
}
