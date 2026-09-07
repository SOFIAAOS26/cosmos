import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Music } from 'lucide-react';
import { BottomSheet, Button, Textarea, Input, Spinner } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useToast } from '@/providers/ToastProvider';
import { uploadPhoto } from '@/features/media/storage';
import {
  createMemory,
  updateMemory,
  setMemorySong,
  removeMemorySong,
} from './api';
import { parseSongUrl } from './soundtrack';
import { formatKey, type DateKey } from '@/utils/date';
import type { Memory, Song } from '@/types/database';

interface MemoryComposerProps {
  open: boolean;
  onClose: () => void;
  cosmosId: string;
  authorId: string;
  date: DateKey;
  /** Edit mode. */
  memory?: Memory | null;
  existingSong?: Song | null;
  /** Signed URL for the current photo (edit mode preview). */
  initialPhotoUrl?: string | null;
  onSaved?: () => void;
}

export function MemoryComposer({
  open,
  onClose,
  cosmosId,
  authorId,
  date,
  memory,
  existingSong,
  initialPhotoUrl,
  onSaved,
}: MemoryComposerProps) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [story, setStory] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form whenever the sheet opens for a given target.
  useEffect(() => {
    if (!open) return;
    setFile(null);
    setPreview(initialPhotoUrl ?? null);
    setStory(memory?.story ?? '');
    setSongUrl(existingSong?.url ?? '');
    setSongTitle(existingSong?.title ?? '');
    setSongArtist(existingSong?.artist ?? '');
    setError(null);
    setSaving(false);
  }, [open, memory, existingSong, initialPhotoUrl]);

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Elige una imagen.');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  }

  const songValid = !songUrl.trim() || parseSongUrl(songUrl) !== null;

  async function save() {
    if (saving) return;
    if (!file && !story.trim() && !memory) {
      setError('Agrega una foto o un pequeño relato.');
      return;
    }
    if (!songValid) {
      setError('El enlace de la canción no es de Spotify ni YouTube.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let photoPath = memory?.photo_url ?? null;
      if (file) {
        const up = await uploadPhoto(cosmosId, file);
        photoPath = up.path;
      }

      let memoryId = memory?.id;
      if (memory) {
        await updateMemory(memory.id, { story: story.trim() || null, photo_url: photoPath, date });
      } else {
        const created = await createMemory({ cosmosId, authorId, date, story, photoPath });
        memoryId = created.id;
      }

      if (memoryId) {
        if (songUrl.trim()) {
          await setMemorySong({
            cosmosId,
            memoryId,
            url: songUrl,
            title: songTitle,
            artist: songArtist,
          });
        } else if (existingSong) {
          await removeMemorySong(memoryId);
        }
      }

      toast.success('Guardado en COSMOS');
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el recuerdo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={memory ? 'Editar recuerdo' : 'Nuevo recuerdo'}
    >
      <div className="space-y-5 py-2">
        <p className="text-xs uppercase tracking-widest text-ink-faint">
          {formatKey(date, "EEEE d 'de' MMMM")}
        </p>

        {/* Photo */}
        <div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickFile} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn(
              'relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/15 bg-white/5 transition-colors hover:bg-white/[0.08]',
            )}
          >
            {preview ? (
              <>
                <img src={preview} alt="" className="h-full w-full object-cover" />
                <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2.5 py-1 text-xs text-ink">
                  Cambiar foto
                </span>
              </>
            ) : (
              <span className="flex flex-col items-center gap-2 text-ink-faint">
                <ImagePlus className="h-7 w-7" />
                <span className="text-sm">Agregar una foto</span>
              </span>
            )}
          </button>
        </div>

        {/* Micro-story */}
        <Textarea
          label="Micro-relato"
          placeholder="Un pequeño detalle de ese día…"
          rows={3}
          value={story}
          onChange={(e) => setStory(e.target.value)}
          maxLength={280}
          hint={`${story.length}/280`}
        />

        {/* Soundtrack */}
        <div className="space-y-3 rounded-xl border border-white/5 bg-surface/60 p-3">
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <Music className="h-4 w-4 text-blossom" />
            Banda sonora <span className="text-ink-faint">(opcional)</span>
          </div>
          <Input
            placeholder="Pega un link de Spotify o YouTube"
            value={songUrl}
            onChange={(e) => setSongUrl(e.target.value)}
            inputMode="url"
            error={songUrl.trim() && !songValid ? 'Enlace no reconocido' : undefined}
          />
          {songUrl.trim() && songValid && (
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Título" value={songTitle} onChange={(e) => setSongTitle(e.target.value)} />
              <Input placeholder="Artista" value={songArtist} onChange={(e) => setSongArtist(e.target.value)} />
            </div>
          )}
        </div>

        {error && <p className="text-sm text-blossom-soft">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button variant="subtle" fullWidth onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="blossom" fullWidth onClick={save} loading={saving}>
            {saving ? 'Guardando' : 'Guardar recuerdo'}
          </Button>
        </div>

        {saving && (
          <p className="flex items-center justify-center gap-2 text-xs text-ink-faint">
            <Spinner className="h-3.5 w-3.5" /> Optimizando y subiendo tu foto…
          </p>
        )}
      </div>
    </BottomSheet>
  );
}
