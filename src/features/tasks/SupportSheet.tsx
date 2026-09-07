import { useState } from 'react';
import { Heart, Send } from 'lucide-react';
import { BottomSheet, Button, Input } from '@/components/ui';
import { SUPPORT_MESSAGES } from '@/types/models';

interface SupportSheetProps {
  open: boolean;
  onClose: () => void;
  toName?: string;
  onSend: (message: string) => Promise<void> | void;
}

/** Send a little encouragement to the other person (§19). */
export function SupportSheet({ open, onClose, toName, onSend }: SupportSheetProps) {
  const [custom, setCustom] = useState('');
  const [sending, setSending] = useState(false);

  async function send(message: string) {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      await onSend(message.trim());
      setCustom('');
      onClose();
    } finally {
      setSending(false);
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-blossom" /> Mandar apoyo{toName ? ` a ${toName}` : ''}
        </span>
      }
    >
      <div className="space-y-4 py-2">
        <div className="flex flex-col gap-2">
          {SUPPORT_MESSAGES.map((m) => (
            <button
              key={m}
              type="button"
              disabled={sending}
              onClick={() => send(m)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-ink transition-colors hover:border-blossom/30 hover:bg-blossom/10 disabled:opacity-50"
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="O escribe algo tuyo…"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(custom)}
          />
          <Button variant="blossom" onClick={() => send(custom)} loading={sending} disabled={!custom.trim()} aria-label="Enviar">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
