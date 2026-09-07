import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { EmptyState, Skeleton, Button } from '@/components/ui';
import { MemoryCard } from '@/features/memories/MemoryCard';
import { MemoryComposer } from '@/features/memories/MemoryComposer';
import { MemoryDetail } from '@/features/memories/MemoryDetail';
import { useSignedUrls } from '@/features/media/useSignedUrls';
import { getSupabase } from '@/lib/supabase';
import { useCosmos } from '@/providers/CosmosProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useRealtimeTable } from '@/hooks/useRealtime';
import { todayKey } from '@/utils/date';
import type { Memory, Song } from '@/types/database';

/**
 * MOMENTS — the past (§14, §16). Postcards of what you've lived, with authoring.
 */
export function MomentsScreen() {
  const { cosmos } = useCosmos();
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[] | null>(null);

  const [composerOpen, setComposerOpen] = useState(false);
  const [editing, setEditing] = useState<{ memory: Memory | null; song: Song | null } | null>(null);
  const [detail, setDetail] = useState<Memory | null>(null);

  const load = useCallback(async () => {
    if (!cosmos) return;
    const supabase = getSupabase();
    const { data } = await supabase
      .from('memories')
      .select('*')
      .eq('cosmos_id', cosmos.id)
      .order('date', { ascending: false });
    setMemories(data ?? []);
  }, [cosmos]);

  useEffect(() => {
    void load();
  }, [load]);
  useRealtimeTable('memories', cosmos?.id, () => void load());

  const paths = useMemo(() => (memories ?? []).map((m) => m.photo_url), [memories]);
  const urls = useSignedUrls(paths);

  function openNew() {
    setEditing(null);
    setComposerOpen(true);
  }
  function openEdit(memory: Memory, song: Song | null) {
    setDetail(null);
    setEditing({ memory, song });
    setComposerOpen(true);
  }

  const editingPhotoUrl = editing?.memory?.photo_url ? urls[editing.memory.photo_url] : null;

  return (
    <Screen
      title="Momentos"
      subtitle="Lo que hemos vivido"
      right={
        memories && memories.length > 0 ? (
          <Button size="sm" variant="blossom" onClick={openNew}>
            <Plus className="h-4 w-4" />
            Recuerdo
          </Button>
        ) : undefined
      }
    >
      {memories === null ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Skeleton className="aspect-[3/4]" />
          <Skeleton className="aspect-[3/4]" />
        </div>
      ) : memories.length === 0 ? (
        <EmptyState
          nedi="idle"
          message="Todavía no hay estrellas aquí."
          action={
            <Button variant="blossom" onClick={openNew}>
              <Plus className="h-4 w-4" />
              Crear el primero
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {memories.map((m) => (
            <MemoryCard
              key={m.id}
              memory={m}
              photoUrl={m.photo_url ? urls[m.photo_url] : null}
              onClick={() => setDetail(m)}
            />
          ))}
        </div>
      )}

      {cosmos && user && (
        <MemoryComposer
          open={composerOpen}
          onClose={() => setComposerOpen(false)}
          cosmosId={cosmos.id}
          authorId={user.id}
          date={editing?.memory?.date ?? todayKey(cosmos.timezone)}
          memory={editing?.memory ?? null}
          existingSong={editing?.song ?? null}
          initialPhotoUrl={editingPhotoUrl}
          onSaved={load}
        />
      )}

      <MemoryDetail
        memory={detail}
        open={detail !== null}
        onClose={() => setDetail(null)}
        onEdit={openEdit}
        onDeleted={load}
      />
    </Screen>
  );
}
