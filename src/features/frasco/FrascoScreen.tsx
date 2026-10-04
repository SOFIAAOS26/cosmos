import { useMemo, useState } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui';
import { Starfield } from '@/components/brand/Starfield';
import { MemoryJar } from './MemoryJar';
import { PaperReveal } from './PaperReveal';
import { PaperCreator } from './PaperCreator';
import { PaperPicker } from './PaperPicker';
import { useFrasco } from './useFrasco';
import { pickPaper, openPaper } from './api';
import { useCosmos } from '@/providers/CosmosProvider';
import { useToast } from '@/providers/ToastProvider';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import type { MemoryPaper } from '@/types/database';
import type { PaperIntention } from '@/types/models';

export function FrascoScreen() {
  const { members } = useCosmos();
  const toast = useToast();
  const reduce = usePrefersReducedMotion();
  const { papers, count, loading, refresh } = useFrasco();

  const [lidOpen, setLidOpen] = useState(false);
  const [glow, setGlow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reveal, setReveal] = useState<MemoryPaper | null>(null);
  const [lastId, setLastId] = useState<string | null>(null);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [lastIntention, setLastIntention] = useState<PaperIntention | null>(null);

  const nameFor = useMemo(() => {
    const m = new Map(members.map((mem) => [mem.user_id, mem.profile.display_name]));
    return (id: string) => m.get(id);
  }, [members]);

  function openOne(intention: PaperIntention | null = lastIntention) {
    if (busy || count === 0) return;
    const chosen = pickPaper(papers, { intention, excludeId: lastId });
    if (!chosen) {
      toast.error('No hay papelitos para esa ocasión todavía.');
      return;
    }
    setLastIntention(intention);
    setBusy(true);
    setGlow(true);
    setLidOpen(true);
    const delay = reduce ? 0 : 700;
    window.setTimeout(async () => {
      try {
        const fresh = await openPaper(chosen.id);
        setReveal(fresh);
        setLastId(fresh.id);
      } catch {
        toast.error('No se pudo abrir');
      } finally {
        setLidOpen(false);
        setGlow(false);
        setBusy(false);
        void refresh();
      }
    }, delay);
  }

  return (
    <Screen title="El Frasco de Nosotros" subtitle="Pequeñas razones para recordar por qué estamos aquí.">
      <div className="relative">
        <Starfield count={24} className="opacity-60" />

        <div className="relative flex flex-col items-center pt-4">
          <div className="mb-2 text-blossom-soft">
            <Sparkles className="h-5 w-5" />
          </div>

          <MemoryJar papers={papers} width={236} lidOpen={lidOpen} glow={glow} onTap={() => navigator.vibrate?.(5)} />

          {/* Count / empty paper #0 */}
          {loading ? (
            <p className="mt-6 text-sm text-ink-faint">Cargando el frasco…</p>
          ) : count > 0 ? (
            <p className="mt-6 font-display text-lg text-ink">
              {count} {count === 1 ? 'recuerdo' : 'recuerdos'}
            </p>
          ) : (
            <div className="mt-6 max-w-xs rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-center">
              <p className="font-hand text-xl text-ink">Este frasco todavía está vacío.</p>
              <p className="mt-1 text-sm text-ink-soft">
                Pero algún día estará lleno de pequeñas razones por las que decidimos quedarnos.
              </p>
            </div>
          )}

          <div className="mt-6 flex w-full max-w-xs flex-col gap-3">
            <Button
              size="lg"
              fullWidth
              onClick={() => setPickerOpen(true)}
              loading={busy}
              disabled={count === 0}
              variant="blossom"
            >
              Abrir un papelito
            </Button>
            <Button size="lg" variant="subtle" fullWidth onClick={() => setCreatorOpen(true)}>
              <Plus className="h-5 w-5" />
              Guardar algo
            </Button>
          </div>
        </div>
      </div>

      <PaperReveal
        paper={reveal}
        authorName={reveal ? nameFor(reveal.author_id) : undefined}
        open={reveal !== null}
        onClose={() => setReveal(null)}
        onAgain={() => {
          setReveal(null);
          window.setTimeout(() => openOne(lastIntention), 250);
        }}
      />

      <PaperPicker
        open={pickerOpen}
        papers={papers}
        onClose={() => setPickerOpen(false)}
        onPick={(intention) => {
          setPickerOpen(false);
          window.setTimeout(() => openOne(intention), reduce ? 0 : 200);
        }}
      />

      <PaperCreator open={creatorOpen} onClose={() => setCreatorOpen(false)} onSaved={refresh} />
    </Screen>
  );
}
