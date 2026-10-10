import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Link2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Screen } from '@/components/layout/Screen';
import { Button, IconButton, BottomSheet, EmptyState, Skeleton, ConfirmDialog } from '@/components/ui';
import { SkyScene } from './SkyScene';
import { useSky } from './useSky';
import { createConstellation, deleteConstellation } from './api';
import { STAR_STYLE, type SkyStar, type StarKind } from './stars';
import { useCosmos } from '@/providers/CosmosProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import type { Identity } from '@/theme/identity';
import type { Constellation } from '@/types/database';

const LEGEND: StarKind[] = ['memory', 'paper', 'comet', 'event', 'note', 'sincronia'];

export function SkyScreen() {
  const navigate = useNavigate();
  const { cosmos, members } = useCosmos();
  const { user } = useAuth();
  const toast = useToast();
  const { stars, constellations, loading, refresh } = useSky();

  const [connect, setConnect] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  const [tapped, setTapped] = useState<SkyStar | null>(null);
  const [toDelete, setToDelete] = useState<Constellation | null>(null);
  const [saving, setSaving] = useState(false);

  const identityOf = useMemo(() => {
    const m = new Map<string, Identity>(members.map((mem) => [mem.user_id, mem.profile.identity]));
    return (authorId: string | null): Identity | null => (authorId ? m.get(authorId) ?? null : null);
  }, [members]);

  function onStarClick(star: SkyStar) {
    if (connect) {
      setSelected((prev) =>
        prev.includes(star.key) ? prev.filter((k) => k !== star.key) : [...prev, star.key],
      );
    } else {
      setTapped(star);
    }
  }

  function cancelConnect() {
    setConnect(false);
    setSelected([]);
    setNaming(false);
    setName('');
  }

  async function save() {
    if (!cosmos || !user || selected.length < 2 || !name.trim()) return;
    setSaving(true);
    try {
      await createConstellation({ cosmosId: cosmos.id, authorId: user.id, name, stars: selected });
      toast.love('Constelación trazada ✦');
      cancelConnect();
      await refresh();
    } catch {
      toast.error('No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteConstellation(toDelete.id);
      setToDelete(null);
      await refresh();
    } catch {
      toast.error('No se pudo eliminar');
    }
  }

  return (
    <Screen
      title="Nuestro cielo"
      subtitle="Cada cosa que vivimos deja una estrella."
      right={
        <IconButton label="Volver" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </IconButton>
      }
    >
      {loading && stars.length === 0 ? (
        <Skeleton className="h-[68vh] min-h-[440px] rounded-3xl" />
      ) : stars.length === 0 ? (
        <EmptyState
          nedi="observing"
          message="Su cielo todavía está oscuro. Cada recuerdo, papelito, cometa o aventura encenderá una estrella."
        />
      ) : (
        <div className="space-y-4">
          <SkyScene
            stars={stars}
            constellations={constellations}
            identityOf={identityOf}
            connect={connect}
            selected={selected}
            onStarClick={onStarClick}
          />

          {/* Controls */}
          {connect ? (
            <div className="flex items-center gap-2">
              <p className="flex-1 text-sm text-ink-soft">
                {selected.length < 2
                  ? 'Toca estrellas para unirlas.'
                  : `${selected.length} estrellas seleccionadas.`}
              </p>
              <Button variant="subtle" size="sm" onClick={cancelConnect}>
                <X className="h-4 w-4" /> Cancelar
              </Button>
              <Button
                variant="blossom"
                size="sm"
                disabled={selected.length < 2}
                onClick={() => setNaming(true)}
              >
                <Check className="h-4 w-4" /> Nombrar
              </Button>
            </div>
          ) : (
            <Button variant="subtle" fullWidth onClick={() => setConnect(true)}>
              <Link2 className="h-4 w-4" /> Unir estrellas en una constelación
            </Button>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
            {LEGEND.map((k) => (
              <span key={k} className="flex items-center gap-1.5 text-xs text-ink-faint">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: k === 'sincronia' ? '#67E8F9' : k === 'memory' ? '#FFFFFF' : '#F9A8D4' }}
                />
                {STAR_STYLE[k].labelEs}
              </span>
            ))}
          </div>

          {/* Saved constellations */}
          {constellations.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-widest text-ink-faint">Constelaciones</p>
              {constellations.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5"
                >
                  <span className="flex items-center gap-2 text-sm text-ink">
                    <Sparkles className="h-4 w-4 text-blossom-soft" />
                    {c.name}
                    <span className="text-xs text-ink-faint">· {c.stars.length}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setToDelete(c)}
                    className="text-xs text-ink-faint hover:text-blossom-soft"
                  >
                    Borrar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Name the constellation */}
      <BottomSheet open={naming} onClose={() => setNaming(false)} title="Nombrar la constelación">
        <div className="space-y-4 py-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="Nuestro invierno, La primera vez…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 font-display text-lg text-ink outline-none focus:border-white/20"
            autoFocus
          />
          <Button variant="blossom" fullWidth onClick={save} loading={saving} disabled={!name.trim()}>
            Trazar constelación
          </Button>
        </div>
      </BottomSheet>

      {/* Star detail (view mode) */}
      <BottomSheet open={tapped !== null} onClose={() => setTapped(null)} title={tapped?.label ?? ''}>
        {tapped && (
          <div className="space-y-4 py-2">
            <p className="text-sm text-ink-soft">
              {tapped.kind === 'sincronia' ? 'Los dos pensaron en el otro' : STAR_STYLE[tapped.kind].labelEs}
              {' · '}
              {format(new Date(tapped.at), "d 'de' MMMM yyyy", { locale: es })}
            </p>
            {tapped.route && (
              <Button
                variant="blossom"
                fullWidth
                onClick={() => {
                  const to = tapped.route!;
                  setTapped(null);
                  navigate(to);
                }}
              >
                Ver
              </Button>
            )}
          </div>
        )}
      </BottomSheet>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="¿Borrar la constelación?"
        message={toDelete ? `Se borrará "${toDelete.name}". Las estrellas se quedan.` : ''}
        confirmLabel="Borrar"
        tone="danger"
      />
    </Screen>
  );
}
