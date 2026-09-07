import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2, Sticker as StickerIcon, Check } from 'lucide-react';
import { BottomSheet, Button, ConfirmDialog, Avatar } from '@/components/ui';
import { SoundtrackCard } from './SoundtrackCard';
import { getSongForMemory, deleteMemory } from './api';
import { MemoryStickers } from '@/features/stickers/MemoryStickers';
import { listGlobalStickers } from '@/features/stickers/api';
import { useSignedUrl } from '@/features/media/useSignedUrls';
import { useCosmos } from '@/providers/CosmosProvider';
import { useToast } from '@/providers/ToastProvider';
import { formatKey } from '@/utils/date';
import { identityOf } from '@/theme/identity';
import type { Memory, Song, Sticker } from '@/types/database';

interface MemoryDetailProps {
  memory: Memory | null;
  open: boolean;
  onClose: () => void;
  onEdit: (memory: Memory, song: Song | null) => void;
  onDeleted: () => void;
}

/** The full postcard — photo, micro-story, soundtrack, with edit/delete. */
export function MemoryDetail({ memory, open, onClose, onEdit, onDeleted }: MemoryDetailProps) {
  const { cosmos, members } = useCosmos();
  const toast = useToast();
  const [song, setSong] = useState<Song | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editStickers, setEditStickers] = useState(false);
  const [stickerLib, setStickerLib] = useState<Sticker[]>([]);
  const photoUrl = useSignedUrl(memory?.photo_url);

  const stickersById = useMemo(
    () => Object.fromEntries(stickerLib.map((s) => [s.id, s])),
    [stickerLib],
  );

  useEffect(() => {
    if (open) void listGlobalStickers().then(setStickerLib);
    if (!open) setEditStickers(false);
  }, [open]);

  const loadSong = useCallback(async () => {
    if (!memory) return setSong(null);
    setSong(await getSongForMemory(memory.id));
  }, [memory]);

  useEffect(() => {
    if (open) void loadSong();
  }, [open, loadSong]);

  const author = members.find((m) => m.user_id === memory?.author_id);
  const id = identityOf(author?.identity);

  async function onConfirmDelete() {
    if (!memory || deleting) return;
    setDeleting(true);
    try {
      await deleteMemory(memory);
      toast.success('Recuerdo eliminado');
      setConfirm(false);
      onDeleted();
      onClose();
    } catch {
      toast.error('No se pudo eliminar');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title={memory ? formatKey(memory.date) : ''}>
        {memory && (
          <div className="space-y-4 py-2">
            {memory.photo_url && photoUrl && (
              <div className="relative overflow-hidden rounded-xl">
                <img src={photoUrl} alt="" className="max-h-[52vh] w-full object-cover" />
                {cosmos && (
                  <MemoryStickers
                    memoryId={memory.id}
                    cosmosId={cosmos.id}
                    editable={editStickers}
                    stickersById={stickersById}
                  />
                )}
              </div>
            )}

            {memory.photo_url && (
              <button
                type="button"
                onClick={() => setEditStickers((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs text-blossom hover:text-blossom-soft"
              >
                {editStickers ? <Check className="h-3.5 w-3.5" /> : <StickerIcon className="h-3.5 w-3.5" />}
                {editStickers ? 'Listo' : 'Poner stickers'}
              </button>
            )}

            {memory.story && (
              <p className="font-display text-lg leading-relaxed text-ink">{memory.story}</p>
            )}

            {song && <SoundtrackCard song={song} />}

            {author && (
              <div className="flex items-center gap-2 pt-1">
                <Avatar
                  name={author.profile.display_name}
                  identity={author.identity}
                  src={author.profile.avatar_url}
                  size="sm"
                />
                <span className={`text-xs ${id.text}`}>{author.profile.display_name}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="subtle" fullWidth onClick={() => onEdit(memory, song)}>
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
        title="¿Borrar este recuerdo?"
        message="Esta estrella se apagará para los dos. No se puede deshacer."
        confirmLabel="Borrar"
      />
    </>
  );
}
