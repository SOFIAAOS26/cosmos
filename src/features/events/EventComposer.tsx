import { useEffect, useState } from 'react';
import { MapPin, LocateFixed } from 'lucide-react';
import { BottomSheet, Button, Input, Textarea, Chip } from '@/components/ui';
import { useToast } from '@/providers/ToastProvider';
import { createEvent, updateEvent } from './api';
import { EVENT_META } from './eventMeta';
import { EVENT_TYPES, type EventType } from '@/types/models';
import { todayKey, type DateKey } from '@/utils/date';
import type { CosmosEvent } from '@/types/database';

interface EventComposerProps {
  open: boolean;
  onClose: () => void;
  cosmosId: string;
  createdBy: string;
  timezone: string;
  defaultDate?: DateKey;
  event?: CosmosEvent | null;
  onSaved?: () => void;
}

export function EventComposer({
  open,
  onClose,
  cosmosId,
  createdBy,
  timezone,
  defaultDate,
  event,
  onSaved,
}: EventComposerProps) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('date');
  const [date, setDate] = useState<DateKey>(defaultDate ?? todayKey(timezone));
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(event?.title ?? '');
    setType(event?.type ?? 'date');
    setDate(event?.date ?? defaultDate ?? todayKey(timezone));
    setTime(event?.time ?? '');
    setLocation(event?.location ?? '');
    setCoords(
      event?.latitude != null && event?.longitude != null
        ? { lat: event.latitude, lon: event.longitude }
        : null,
    );
    setDescription(event?.description ?? '');
    setError(null);
    setSaving(false);
  }, [open, event, defaultDate, timezone]);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocating(false);
        toast.success('Ubicación agregada');
      },
      () => {
        setLocating(false);
        toast.error('No se pudo obtener la ubicación');
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  async function save() {
    if (saving) return;
    if (!title.trim()) return setError('Ponle un título al evento.');
    if (!date) return setError('Elige una fecha.');
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title,
        date,
        time: time || null,
        location: location || null,
        latitude: coords?.lat ?? null,
        longitude: coords?.lon ?? null,
        description: description || null,
        type,
      };
      if (event) {
        await updateEvent(event.id, payload);
      } else {
        await createEvent({ cosmosId, createdBy, ...payload });
      }
      toast.success('Guardado en COSMOS');
      onSaved?.();
      onClose();
    } catch {
      setError('No se pudo guardar el evento.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={event ? 'Editar evento' : 'Nuevo evento'}>
      <div className="space-y-5 py-2">
        <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Concierto, cena, viaje…" autoFocus />

        <div>
          <p className="mb-2 text-sm font-medium text-ink-soft">Tipo</p>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((t) => {
              const Icon = EVENT_META[t].icon;
              return (
                <Chip key={t} selected={type === t} onClick={() => setType(t)}>
                  <Icon className="h-3.5 w-3.5" />
                  {EVENT_META[t].label}
                </Chip>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Hora" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        <div>
          <Input
            label="Lugar"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Nombre del lugar"
          />
          <button
            type="button"
            onClick={useMyLocation}
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-blossom hover:text-blossom-soft"
          >
            <LocateFixed className="h-3.5 w-3.5" />
            {locating ? 'Obteniendo…' : coords ? 'Ubicación en el mapa ✓' : 'Usar mi ubicación (mapa)'}
          </button>
          {coords && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-faint">
              <MapPin className="h-3 w-3" /> {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
            </p>
          )}
        </div>

        <Textarea label="Notas (opcional)" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />

        {error && <p className="text-sm text-blossom-soft">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button variant="subtle" fullWidth onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button fullWidth onClick={save} loading={saving}>
            Guardar evento
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
