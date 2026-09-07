import { useEffect, useState } from 'react';
import { BottomSheet, Button, Input, Textarea, Chip } from '@/components/ui';
import { useToast } from '@/providers/ToastProvider';
import { createNote } from './api';
import type { NoteKind } from '@/types/models';

interface NoteComposerProps {
  open: boolean;
  onClose: () => void;
  cosmosId: string;
  authorId: string;
  recipientId?: string | null;
  onSaved?: () => void;
}

const KINDS: { key: NoteKind; label: string; hint: string }[] = [
  { key: 'immediate', label: 'Inmediata', hint: 'Se ve enseguida.' },
  { key: 'scheduled', label: 'Programada', hint: 'Se abre en una fecha.' },
  { key: 'sealed', label: 'Sellada', hint: 'Se abre con un gesto.' },
];

export function NoteComposer({ open, onClose, cosmosId, authorId, recipientId, onSaved }: NoteComposerProps) {
  const toast = useToast();
  const [kind, setKind] = useState<NoteKind>('immediate');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [when, setWhen] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setKind('immediate');
    setTitle('');
    setBody('');
    setWhen('');
    setError(null);
    setSaving(false);
  }, [open]);

  async function save() {
    if (saving) return;
    if (!body.trim()) return setError('Escribe algo.');
    if (kind === 'scheduled' && !when) return setError('Elige cuándo se abre.');
    setSaving(true);
    setError(null);
    try {
      await createNote({
        cosmosId,
        authorId,
        recipientId,
        kind,
        title,
        body,
        unlockAt: kind === 'scheduled' ? new Date(when).toISOString() : null,
      });
      toast.success('Guardado en COSMOS');
      onSaved?.();
      onClose();
    } catch {
      setError('No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  const activeHint = KINDS.find((k) => k.key === kind)?.hint;

  return (
    <BottomSheet open={open} onClose={onClose} title="Nueva nota">
      <div className="space-y-5 py-2">
        <div>
          <div className="flex gap-2">
            {KINDS.map((k) => (
              <Chip key={k.key} selected={kind === k.key} onClick={() => setKind(k.key)}>
                {k.label}
              </Chip>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-faint">{activeHint}</p>
        </div>

        <Input label="Título (opcional)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea label="Mensaje" rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Para la otra persona…" />

        {kind === 'scheduled' && (
          <Input
            label="Se abre el"
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />
        )}

        {error && <p className="text-sm text-blossom-soft">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button variant="subtle" fullWidth onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="blossom" fullWidth onClick={save} loading={saving}>
            Dejar nota
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
