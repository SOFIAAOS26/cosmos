import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Lock } from 'lucide-react';
import { BottomSheet, Button, Spinner } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useToast } from '@/providers/ToastProvider';
import { useCosmos } from '@/providers/CosmosProvider';
import { useAuth } from '@/providers/AuthProvider';
import { uploadPhoto } from '@/features/media/storage';
import { createPaper } from './api';
import {
  PAPER_COLORS,
  PAPER_INTENTIONS,
  paperColorStyle,
  PAPER_INK,
  type PaperColor,
  type PaperIntention,
} from '@/types/models';

interface PaperCreatorProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function PaperCreator({ open, onClose, onSaved }: PaperCreatorProps) {
  const { cosmos, partner } = useCosmos();
  const { user } = useAuth();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState('');
  const [color, setColor] = useState<PaperColor>('cream');
  const [intention, setIntention] = useState<PaperIntention>('anytime');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [secret, setSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setMessage('');
    setColor('cream');
    setIntention('anytime');
    setFile(null);
    setPreview(null);
    setSecret(false);
    setError(null);
    setSaving(false);
  }, [open]);

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function save() {
    if (saving) return;
    if (!cosmos || !user) return;
    if (!message.trim()) return setError('Escribe algo primero.');
    setSaving(true);
    setError(null);
    try {
      let imageUrl: string | null = null;
      if (file) imageUrl = (await uploadPhoto(cosmos.id, file)).path;
      await createPaper({
        cosmosId: cosmos.id,
        authorId: user.id,
        message,
        color,
        intention: secret ? 'secret' : intention,
        imageUrl,
        recipientId: secret ? partner?.user_id ?? null : null,
        isSecret: secret,
      });
      navigator.vibrate?.(8);
      toast.love('Guardado entre nosotros.');
      onSaved?.();
      onClose();
    } catch {
      setError('No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  const c = paperColorStyle(color);

  return (
    <BottomSheet open={open} onClose={onClose} title="Guardar algo">
      <div className="space-y-5 py-2">
        {/* The blank paper you write on */}
        <div
          className="rounded-xl p-4"
          style={{
            background: `linear-gradient(135deg, ${c.paper} 0%, ${c.shade} 120%)`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 10px 30px -12px rgba(0,0,0,0.6)',
          }}
        >
          {preview && (
            <div className="mx-auto mb-3 w-32 -rotate-2 bg-white p-1.5 pb-4 shadow-md">
              <img src={preview} alt="" className="h-28 w-full object-cover" />
            </div>
          )}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Escribe algo que quieras que encontremos después."
            className="w-full resize-none bg-transparent font-hand text-2xl leading-snug outline-none placeholder:opacity-50"
            style={{ color: PAPER_INK }}
            autoFocus
          />
        </div>

        {/* Color */}
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-ink-faint">Color</p>
          <div className="flex flex-wrap gap-2">
            {PAPER_COLORS.map((pc) => (
              <button
                key={pc.key}
                type="button"
                onClick={() => setColor(pc.key)}
                aria-label={pc.label}
                className={cn(
                  'h-8 w-8 rounded-full ring-2 transition-transform active:scale-90',
                  color === pc.key ? 'ring-white/80' : 'ring-transparent',
                )}
                style={{ background: pc.paper }}
              />
            ))}
          </div>
        </div>

        {/* Intention */}
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-ink-faint">¿Cuándo abrirla?</p>
          <div className="flex flex-wrap gap-2">
            {PAPER_INTENTIONS.filter((i) => i.key !== 'secret').map((i) => (
              <button
                key={i.key}
                type="button"
                onClick={() => setIntention(i.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
                  intention === i.key && !secret
                    ? 'border-transparent bg-ink text-void'
                    : 'border-white/10 bg-white/5 text-ink-soft hover:text-ink',
                  secret && 'opacity-40',
                )}
                disabled={secret}
              >
                <span>{i.emoji}</span>
                {i.label}
              </button>
            ))}
          </div>
        </div>

        {/* Photo + secret */}
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickFile} />
          <Button variant="subtle" size="sm" onClick={() => fileRef.current?.click()}>
            <ImagePlus className="h-4 w-4" />
            {file ? 'Cambiar foto' : 'Agregar foto'}
          </Button>
          <button
            type="button"
            onClick={() => setSecret((s) => !s)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
              secret
                ? 'border-blossom/40 bg-blossom/10 text-blossom'
                : 'border-white/10 bg-white/5 text-ink-soft hover:text-ink',
            )}
          >
            <Lock className="h-4 w-4" />
            {partner ? `Secreto para ${partner.profile.display_name}` : 'Secreto'}
          </button>
        </div>

        {error && <p className="text-sm text-blossom-soft">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button variant="subtle" fullWidth onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="blossom" fullWidth onClick={save} loading={saving}>
            Guardar en el frasco
          </Button>
        </div>
        {saving && file && (
          <p className="flex items-center justify-center gap-2 text-xs text-ink-faint">
            <Spinner className="h-3.5 w-3.5" /> Doblando el papel…
          </p>
        )}
      </div>
    </BottomSheet>
  );
}
