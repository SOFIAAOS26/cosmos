import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Link2, Music, X } from 'lucide-react';
import { BottomSheet, Button, Spinner } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useToast } from '@/providers/ToastProvider';
import { useCosmos } from '@/providers/CosmosProvider';
import { useAuth } from '@/providers/AuthProvider';
import { uploadPhoto } from '@/features/media/storage';
import { parseSongUrl } from '@/features/memories/soundtrack';
import { createComet } from './api';

interface CometCreatorProps {
  open: boolean;
  onClose: () => void;
  onSent?: () => void;
}

export function CometCreator({ open, onClose, onSent }: CometCreatorProps) {
  const { cosmos, partner } = useCosmos();
  const { user } = useAuth();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [note, setNote] = useState('');
  const [link, setLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setNote('');
    setLink('');
    setFile(null);
    setPreview(null);
    setError(null);
    setSending(false);
  }, [open]);

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  const song = link.trim() ? parseSongUrl(link.trim()) : null;
  const hasContent = Boolean(note.trim() || file || link.trim());

  async function send() {
    if (sending) return;
    if (!cosmos || !user) return;
    if (!partner) return setError('Necesitas a tu otra persona para mandar un cometa.');
    if (!hasContent) return setError('Agrega una nota, una foto o un link.');
    setSending(true);
    setError(null);
    try {
      let imageUrl: string | null = null;
      if (file) imageUrl = (await uploadPhoto(cosmos.id, file)).path;
      await createComet({
        cosmosId: cosmos.id,
        authorId: user.id,
        recipientId: partner.user_id,
        note,
        imageUrl,
        linkUrl: link,
      });
      navigator.vibrate?.(8);
      toast.love('Cometa en camino ✦');
      onSent?.();
      onClose();
    } catch {
      setError('No se pudo enviar el cometa.');
    } finally {
      setSending(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Enviar un cometa">
      <div className="space-y-5 py-2">
        <p className="text-sm text-ink-soft">
          Algo que hoy te recordó a {partner?.profile.display_name ?? 'tu persona'} — se abrirá en su
          inicio como una estrella fugaz.
        </p>

        {/* Note */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Hoy me recordó a ti…"
          className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] p-3 font-hand text-2xl leading-snug text-ink outline-none placeholder:text-ink-faint/60 focus:border-white/20"
          autoFocus
        />

        {/* Photo */}
        {preview ? (
          <div className="relative overflow-hidden rounded-xl">
            <img src={preview} alt="" className="max-h-56 w-full object-cover" />
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
              aria-label="Quitar foto"
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-void/70 text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickFile} />
            <Button variant="subtle" size="sm" onClick={() => fileRef.current?.click()}>
              <ImagePlus className="h-4 w-4" />
              Agregar foto
            </Button>
          </div>
        )}

        {/* Link */}
        <div>
          <div
            className={cn(
              'flex items-center gap-2 rounded-xl border bg-white/[0.03] px-3',
              link.trim() ? 'border-white/20' : 'border-white/10',
            )}
          >
            {song ? (
              <Music className="h-4 w-4 shrink-0 text-blossom-soft" />
            ) : (
              <Link2 className="h-4 w-4 shrink-0 text-ink-faint" />
            )}
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              inputMode="url"
              placeholder="Pega una canción, un reel, un TikTok…"
              className="w-full bg-transparent py-3 text-sm text-ink outline-none placeholder:text-ink-faint/60"
            />
          </div>
          {song && (
            <p className="mt-1.5 text-xs text-blossom-soft">
              ✓ {song.platform === 'spotify' ? 'Spotify' : 'YouTube'} detectado — se verá dentro del
              cometa
            </p>
          )}
        </div>

        {error && <p className="text-sm text-blossom-soft">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button variant="subtle" fullWidth onClick={onClose} disabled={sending}>
            Cancelar
          </Button>
          <Button variant="blossom" fullWidth onClick={send} loading={sending} disabled={!hasContent}>
            Lanzar cometa
          </Button>
        </div>
        {sending && file && (
          <p className="flex items-center justify-center gap-2 text-xs text-ink-faint">
            <Spinner className="h-3.5 w-3.5" /> Preparando el cometa…
          </p>
        )}
      </div>
    </BottomSheet>
  );
}
