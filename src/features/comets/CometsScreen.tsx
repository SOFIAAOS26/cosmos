import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Image as ImageIcon, Music, Link2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Screen } from '@/components/layout/Screen';
import { Button, IconButton, Skeleton } from '@/components/ui';
import { Starfield } from '@/components/brand/Starfield';
import { cn } from '@/utils/cn';
import { CometCreator } from './CometCreator';
import { CometReveal } from './CometReveal';
import { useComets } from './useComets';
import { markCometSeen } from './api';
import { useCosmos } from '@/providers/CosmosProvider';
import { useAuth } from '@/providers/AuthProvider';
import type { Comet } from '@/types/database';

function snippet(c: Comet): { icon: typeof Sparkles; text: string } {
  if (c.note) return { icon: Sparkles, text: c.note };
  if (c.image_url) return { icon: ImageIcon, text: 'Una foto' };
  if (c.link_url) {
    const song = /spotify|youtu/.test(c.link_url);
    return { icon: song ? Music : Link2, text: song ? 'Una canción' : 'Un link' };
  }
  return { icon: Sparkles, text: 'Un cometa' };
}

export function CometsScreen() {
  const navigate = useNavigate();
  const { members } = useCosmos();
  const { user } = useAuth();
  const { comets, loading, refresh } = useComets();
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [opened, setOpened] = useState<Comet | null>(null);

  const nameFor = useMemo(() => {
    const m = new Map(members.map((mem) => [mem.user_id, mem.profile.display_name]));
    return (id: string) => m.get(id);
  }, [members]);

  function open(c: Comet) {
    setOpened(c);
    if (c.recipient_id === user?.id && !c.seen_at) {
      void markCometSeen(c.id)
        .then(() => refresh())
        .catch(() => {});
    }
  }

  return (
    <Screen
      title="Cometas"
      subtitle="Lo que hoy nos recordó al otro"
      right={
        <IconButton label="Volver" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </IconButton>
      }
    >
      <div className="space-y-4">
        {/* Primary action — always visible, left-aligned, can't get lost */}
        <Button variant="blossom" fullWidth onClick={() => setCreatorOpen(true)}>
          <Plus className="h-4 w-4" /> Enviar un cometa
        </Button>

        <div className="relative">
          <Starfield count={20} className="opacity-50" />

          {loading && comets.length === 0 ? (
            <div className="space-y-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : comets.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-soft">
              Aún no hay cometas. Manda el primero — algo que hoy te recordó a tu persona.
            </p>
          ) : (
            <div className="relative space-y-2">
              {comets.map((c) => {
                const received = c.recipient_id === user?.id;
                const unseen = received && !c.seen_at;
                const { icon: Icon, text } = snippet(c);
                const other = received ? c.author_id : c.recipient_id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => open(c)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                      unseen
                        ? 'border-blossom/30 bg-blossom/10 hover:bg-blossom/15'
                        : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]',
                    )}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/5 text-blossom-soft">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">{text}</span>
                      <span className="block truncate text-xs text-ink-faint">
                        {received
                          ? `De ${nameFor(other) ?? 'tu persona'}`
                          : `Para ${nameFor(other) ?? 'tu persona'}`}
                        {' · '}
                        {format(new Date(c.created_at), "d 'de' MMM", { locale: es })}
                      </span>
                    </span>
                    {unseen && <span className="h-2 w-2 shrink-0 rounded-full bg-blossom shadow-blossom" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CometReveal
        comet={opened}
        authorName={opened ? nameFor(opened.author_id) : undefined}
        open={opened !== null}
        onClose={() => setOpened(null)}
      />
      <CometCreator open={creatorOpen} onClose={() => setCreatorOpen(false)} onSent={refresh} />
    </Screen>
  );
}
