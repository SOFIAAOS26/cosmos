import { useState } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { cn } from '@/utils/cn';
import { CHECKIN_MOODS, type CheckinMood } from '@/types/models';

interface CheckInDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (mood: CheckinMood, note: string) => Promise<void> | void;
}

/** "¿Cómo te fue?" after finishing something important (§20). */
export function CheckInDialog({ open, onClose, onSubmit }: CheckInDialogProps) {
  const [mood, setMood] = useState<CheckinMood | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!mood || saving) return;
    setSaving(true);
    try {
      await onSubmit(mood, note);
      setMood(null);
      setNote('');
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="¿Cómo te fue?">
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-2">
          {CHECKIN_MOODS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMood(m.key)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border p-2 transition-all',
                mood === m.key ? 'border-blossom/50 bg-blossom/10' : 'border-white/10 hover:bg-white/5',
              )}
              title={m.label}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[9px] leading-tight text-ink-faint">{m.label}</span>
            </button>
          ))}
        </div>

        <Input placeholder="Una palabra… (opcional)" value={note} onChange={(e) => setNote(e.target.value)} />

        <div className="flex gap-3">
          <Button variant="subtle" fullWidth onClick={onClose} disabled={saving}>
            Ahora no
          </Button>
          <Button variant="blossom" fullWidth onClick={submit} loading={saving} disabled={!mood}>
            Compartir
          </Button>
        </div>
      </div>
    </Modal>
  );
}
