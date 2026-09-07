import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Button, EmptyState, Skeleton } from '@/components/ui';
import { NextMomentCard } from '@/features/observatory/NextMomentCard';
import { EventCard } from '@/features/events/EventCard';
import { EventComposer } from '@/features/events/EventComposer';
import { EventDetail } from '@/features/events/EventDetail';
import { CountdownComposer } from '@/features/countdowns/CountdownComposer';
import { BucketList } from '@/features/bucket/BucketList';
import { useUpcomingEvents } from '@/features/events/useEvents';
import { usePrimaryCountdown } from '@/features/countdowns/usePrimaryCountdown';
import { useCosmos } from '@/providers/CosmosProvider';
import { useAuth } from '@/providers/AuthProvider';
import type { CosmosEvent } from '@/types/database';

export function FutureScreen() {
  const { cosmos } = useCosmos();
  const { user } = useAuth();
  const { events, loading, refresh } = useUpcomingEvents();
  const { moment } = usePrimaryCountdown();

  const [composerOpen, setComposerOpen] = useState(false);
  const [editing, setEditing] = useState<CosmosEvent | null>(null);
  const [detail, setDetail] = useState<CosmosEvent | null>(null);
  const [countdownOpen, setCountdownOpen] = useState(false);

  function openNew() {
    setEditing(null);
    setComposerOpen(true);
  }

  return (
    <Screen
      title="Futuro"
      subtitle="Lo que queremos vivir"
      right={
        <Button size="sm" variant="blossom" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Evento
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Próxima aventura */}
        <section>
          <NextMomentCard />
          <button
            type="button"
            onClick={() => setCountdownOpen(true)}
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-faint hover:text-ink"
          >
            <Pencil className="h-3.5 w-3.5" />
            {moment?.source === 'countdown' ? 'Editar cuenta regresiva' : 'Fijar una cuenta regresiva'}
          </button>
        </section>

        {/* Próximos eventos */}
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-faint">
            Próximos eventos
          </h2>
          {loading && events.length === 0 ? (
            <div className="space-y-2">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              nedi="observing"
              message="El futuro está esperando."
              action={
                <Button variant="blossom" onClick={openNew}>
                  <Plus className="h-4 w-4" />
                  Crear un evento
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {events.map((ev) => (
                <EventCard key={ev.id} event={ev} onClick={() => setDetail(ev)} />
              ))}
            </div>
          )}
        </section>

        {/* Bucket list */}
        <section>
          <BucketList />
        </section>
      </div>

      {cosmos && user && (
        <EventComposer
          open={composerOpen}
          onClose={() => setComposerOpen(false)}
          cosmosId={cosmos.id}
          createdBy={user.id}
          timezone={cosmos.timezone}
          event={editing}
          onSaved={refresh}
        />
      )}

      {cosmos && user && (
        <CountdownComposer
          open={countdownOpen}
          onClose={() => setCountdownOpen(false)}
          cosmosId={cosmos.id}
          createdBy={user.id}
          initialTitle={moment?.source === 'countdown' ? moment.title : undefined}
          initialTargetIso={moment?.source === 'countdown' ? moment.target : null}
          hasExisting={moment?.source === 'countdown'}
          onSaved={refresh}
        />
      )}

      <EventDetail
        event={detail}
        open={detail !== null}
        onClose={() => setDetail(null)}
        onEdit={(ev) => {
          setDetail(null);
          setEditing(ev);
          setComposerOpen(true);
        }}
        onChanged={refresh}
      />
    </Screen>
  );
}
