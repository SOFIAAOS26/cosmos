import { useState } from 'react';
import { Pencil, Trash2, Star } from 'lucide-react';
import { BottomSheet, Button, ConfirmDialog, Divider } from '@/components/ui';
import { EventTicket } from './EventTicket';
import { deleteEvent } from './api';
import { eventInstantIso } from './eventMeta';
import { setPrimaryCountdown } from '@/features/countdowns/api';
import { useCosmos } from '@/providers/CosmosProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import type { CosmosEvent } from '@/types/database';

interface EventDetailProps {
  event: CosmosEvent | null;
  open: boolean;
  onClose: () => void;
  onEdit: (event: CosmosEvent) => void;
  onChanged: () => void;
}

export function EventDetail({ event, open, onClose, onEdit, onChanged }: EventDetailProps) {
  const { cosmos } = useCosmos();
  const { user } = useAuth();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pinning, setPinning] = useState(false);

  async function pinAsCountdown() {
    if (!cosmos || !user || !event) return;
    setPinning(true);
    try {
      await setPrimaryCountdown({
        cosmosId: cosmos.id,
        createdBy: user.id,
        title: event.title,
        targetIso: eventInstantIso(event.date, event.time),
        eventId: event.id,
      });
      toast.love('Fijado como su próxima aventura ✨');
      onChanged();
    } catch {
      toast.error('No se pudo fijar');
    } finally {
      setPinning(false);
    }
  }

  async function onConfirmDelete() {
    if (!event) return;
    setDeleting(true);
    try {
      await deleteEvent(event.id);
      toast.success('Evento eliminado');
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
      <BottomSheet open={open} onClose={onClose} showClose>
        {event && (
          <div className="space-y-4 py-2">
            <EventTicket event={event} />

            <Button variant="blossom" fullWidth onClick={pinAsCountdown} loading={pinning}>
              <Star className="h-4 w-4" />
              Fijar como próxima aventura
            </Button>

            <Divider />

            <div className="flex gap-3">
              <Button variant="subtle" fullWidth onClick={() => onEdit(event)}>
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
              <Button variant="danger" onClick={() => setConfirm(true)} aria-label="Eliminar">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={onConfirmDelete}
        loading={deleting}
        tone="danger"
        title="¿Borrar este evento?"
        confirmLabel="Borrar"
      />
    </>
  );
}
