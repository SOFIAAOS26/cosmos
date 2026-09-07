import { useCallback, useEffect, useState } from 'react';
import { MapPin, Clock, Pencil, ImagePlus } from 'lucide-react';
import { BottomSheet, Button, Divider } from '@/components/ui';
import { NediScene } from '@/components/nedi';
import { formatKey, type DateKey } from '@/utils/date';
import { useDay } from '@/features/day/useDay';
import { useCosmos } from '@/providers/CosmosProvider';
import { useAuth } from '@/providers/AuthProvider';
import { MemoryComposer } from '@/features/memories/MemoryComposer';
import { SoundtrackCard } from '@/features/memories/SoundtrackCard';
import { getSongForMemory } from '@/features/memories/api';
import { useSignedUrl } from '@/features/media/useSignedUrls';
import { TaskRadar } from '@/features/tasks/TaskRadar';
import type { Song } from '@/types/database';

interface DaySheetProps {
  dateKey: DateKey | null;
  open: boolean;
  onClose: () => void;
}

export function DaySheet({ dateKey, open, onClose }: DaySheetProps) {
  const { cosmos } = useCosmos();
  const { user } = useAuth();
  const { memory, events, loading, refresh } = useDay(open ? dateKey : null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [song, setSong] = useState<Song | null>(null);
  const memoryPhotoUrl = useSignedUrl(memory?.photo_url);

  const title = dateKey ? formatKey(dateKey, "EEEE d 'de' MMMM") : '';

  const loadSong = useCallback(async () => {
    setSong(memory ? await getSongForMemory(memory.id) : null);
  }, [memory]);
  useEffect(() => {
    void loadSong();
  }, [loadSong]);

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title={<span className="capitalize">{title}</span>}>
        {loading ? (
          <div className="space-y-3 py-6">
            <div className="h-20 animate-pulse rounded-xl bg-white/5" />
            <div className="h-12 animate-pulse rounded-xl bg-white/5" />
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {/* MOMENT OF THE DAY */}
            <section>
              <div className="mb-2 flex items-center justify-between">
                <SectionTitle>Momento del día</SectionTitle>
                {memory && (
                  <button
                    type="button"
                    onClick={() => setComposerOpen(true)}
                    className="inline-flex items-center gap-1 text-xs text-ink-faint hover:text-ink"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </button>
                )}
              </div>
              {memory ? (
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-xl border border-white/5 bg-surface">
                    {memory.photo_url && memoryPhotoUrl ? (
                      <img src={memoryPhotoUrl} alt="" className="max-h-72 w-full object-cover" />
                    ) : null}
                    {memory.story && (
                      <p className="p-4 font-display leading-relaxed text-ink">{memory.story}</p>
                    )}
                  </div>
                  {song && <SoundtrackCard song={song} />}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 py-6">
                  <NediScene state="idle" size={92} caption="Todavía no hay un recuerdo aquí." />
                  <div className="mt-4 flex justify-center">
                    <Button variant="subtle" size="sm" onClick={() => setComposerOpen(true)}>
                      <ImagePlus className="h-4 w-4" />
                      Agregar recuerdo
                    </Button>
                  </div>
                </div>
              )}
            </section>

            <Divider />

            {/* TASK RADAR */}
            {dateKey && <TaskRadar dateKey={dateKey} />}

            {/* EVENTS */}
            {events.length > 0 && (
              <section>
                <SectionTitle>Eventos</SectionTitle>
                <div className="space-y-2">
                  {events.map((ev) => (
                    <div key={ev.id} className="rounded-xl border border-white/5 bg-surface px-3 py-2.5">
                      <p className="text-sm text-ink">{ev.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-ink-faint">
                        {ev.time && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {ev.time}
                          </span>
                        )}
                        {ev.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {ev.location}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </BottomSheet>

      {cosmos && user && dateKey && (
        <MemoryComposer
          open={composerOpen}
          onClose={() => setComposerOpen(false)}
          cosmosId={cosmos.id}
          authorId={user.id}
          date={dateKey}
          memory={memory}
          existingSong={song}
          initialPhotoUrl={memoryPhotoUrl}
          onSaved={() => {
            void refresh();
            void loadSong();
          }}
        />
      )}
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-faint">{children}</h3>;
}
