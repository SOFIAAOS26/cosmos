import { useEffect, useState } from 'react';
import { BottomSheet, Button, Input } from '@/components/ui';
import { useToast } from '@/providers/ToastProvider';
import { setPrimaryCountdown, clearPrimaryCountdown } from './api';

interface CountdownComposerProps {
  open: boolean;
  onClose: () => void;
  cosmosId: string;
  createdBy: string;
  initialTitle?: string;
  initialTargetIso?: string | null;
  hasExisting?: boolean;
  onSaved?: () => void;
}

export function CountdownComposer({
  open,
  onClose,
  cosmosId,
  createdBy,
  initialTitle,
  initialTargetIso,
  hasExisting,
  onSaved,
}: CountdownComposerProps) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(initialTitle ?? 'Próxima aventura');
    if (initialTargetIso) {
      const d = new Date(initialTargetIso);
      setDate(d.toISOString().slice(0, 10));
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      setTime(hh === '00' && mm === '00' ? '' : `${hh}:${mm}`);
    } else {
      setDate('');
      setTime('');
    }
    setError(null);
    setSaving(false);
  }, [open, initialTitle, initialTargetIso]);

  async function save() {
    if (saving) return;
    if (!title.trim()) return setError('Ponle un nombre.');
    if (!date) return setError('Elige la fecha objetivo.');
    setSaving(true);
    setError(null);
    try {
      const targetIso = new Date(`${date}T${time || '00:00'}:00`).toISOString();
      await setPrimaryCountdown({ cosmosId, createdBy, title, targetIso });
      toast.success('Guardado en COSMOS');
      onSaved?.();
      onClose();
    } catch {
      setError('No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function clear() {
    setSaving(true);
    try {
      await clearPrimaryCountdown(cosmosId);
      toast.success('Cuenta regresiva quitada');
      onSaved?.();
      onClose();
    } catch {
      setError('No se pudo quitar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Próxima aventura">
      <div className="space-y-5 py-2">
        <Input label="Nombre" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nuestro viaje…" autoFocus />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Hora (opcional)" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        {error && <p className="text-sm text-blossom-soft">{error}</p>}
        <div className="flex gap-3">
          {hasExisting && (
            <Button variant="subtle" onClick={clear} disabled={saving}>
              Quitar
            </Button>
          )}
          <Button variant="blossom" fullWidth onClick={save} loading={saving}>
            Guardar
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
