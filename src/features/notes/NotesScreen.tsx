import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Button, EmptyState, Skeleton, ConfirmDialog, IconButton } from '@/components/ui';
import { NoteCard } from './NoteCard';
import { NoteComposer } from './NoteComposer';
import { useNotes } from './useNotes';
import { deleteNote } from './api';
import { useCosmos } from '@/providers/CosmosProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import type { Note } from '@/types/database';

export function NotesScreen() {
  const navigate = useNavigate();
  const { cosmos, members, partner } = useCosmos();
  const { user } = useAuth();
  const toast = useToast();
  const { notes, loading, refresh } = useNotes();
  const [composerOpen, setComposerOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Note | null>(null);

  const memberFor = useMemo(() => {
    const m = new Map(members.map((mem) => [mem.user_id, mem]));
    return (uid: string) => m.get(uid) ?? null;
  }, [members]);

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteNote(toDelete.id);
      setToDelete(null);
      await refresh();
    } catch {
      toast.error('No se pudo eliminar');
    }
  }

  return (
    <Screen
      title="Notas"
      subtitle="Pequeños mensajes entre los dos"
      right={
        <div className="flex items-center gap-1">
          <IconButton label="Volver" size="sm" onClick={() => navigate('/more')}>
            <ArrowLeft className="h-5 w-5" />
          </IconButton>
          <Button size="sm" variant="blossom" onClick={() => setComposerOpen(true)}>
            <Plus className="h-4 w-4" /> Nota
          </Button>
        </div>
      }
    >
      {loading && notes.length === 0 ? (
        <div className="space-y-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          nedi="happy"
          message="Deja una nota para encontrarla después."
          action={
            <Button variant="blossom" onClick={() => setComposerOpen(true)}>
              <Plus className="h-4 w-4" /> Escribir una nota
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              viewerId={user?.id ?? ''}
              author={memberFor(note.author_id)}
              onChanged={refresh}
              onDelete={setToDelete}
            />
          ))}
        </div>
      )}

      {cosmos && user && (
        <NoteComposer
          open={composerOpen}
          onClose={() => setComposerOpen(false)}
          cosmosId={cosmos.id}
          authorId={user.id}
          recipientId={partner?.user_id ?? null}
          onSaved={refresh}
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        tone="danger"
        title="¿Borrar esta nota?"
        confirmLabel="Borrar"
      />
    </Screen>
  );
}
