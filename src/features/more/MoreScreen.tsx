import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Copy, Check, Pencil, StickyNote, ChevronRight, Languages, Music2, ArrowUpRight } from 'lucide-react';
import { Screen } from '@/components/layout/Screen';
import { Card, GlassCard, Avatar, Button, Input, Badge, ConfirmDialog, Divider } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { useCosmos } from '@/providers/CosmosProvider';
import { useToast } from '@/providers/ToastProvider';
import { useInvite } from '@/features/onboarding/useInvite';
import { getSupabase } from '@/lib/supabase';
import { identityOf } from '@/theme/identity';

export function MoreScreen() {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { cosmos, members, me, partner } = useCosmos();
  const toast = useToast();
  const alone = members.length < 2;
  const { code } = useInvite(alone);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.display_name ?? '');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);

  async function saveName() {
    if (!user || !name.trim() || saving) return;
    setSaving(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: name.trim() })
        .eq('id', user.id);
      if (error) throw error;
      await refreshProfile();
      setEditing(false);
      toast.success('Guardado');
    } catch {
      toast.error('No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  async function copyCode() {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Código copiado');
    window.setTimeout(() => setCopied(false), 2000);
  }

  const myId = identityOf(me?.identity ?? profile?.identity);

  return (
    <Screen title="Más" subtitle="Tu perfil y tu cosmos">
      <div className="space-y-4">
        {/* Profile */}
        <Card>
          <div className="flex items-center gap-4">
            <Avatar
              name={profile?.display_name ?? 'Tú'}
              identity={me?.identity ?? profile?.identity}
              src={profile?.avatar_url}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              {editing ? (
                <div className="flex items-center gap-2">
                  <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                  <Button size="sm" onClick={saveName} loading={saving}>
                    Guardar
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="truncate font-display text-lg text-ink">
                    {profile?.display_name}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setName(profile?.display_name ?? '');
                      setEditing(true);
                    }}
                    className="text-ink-faint hover:text-ink"
                    aria-label="Editar nombre"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              )}
              <Badge tone={myId.key === 'blossom' ? 'blossom' : 'noir'} className="mt-1">
                {myId.label}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Cosmos */}
        <Card>
          <p className="text-xs uppercase tracking-widest text-ink-faint">Nuestro cosmos</p>
          <p className="mt-1 font-display text-lg text-ink">{cosmos?.name}</p>
          <p className="mt-0.5 text-sm text-ink-faint">Zona horaria · {cosmos?.timezone}</p>

          <Divider className="my-4" />

          <div className="space-y-2">
            {members.map((m) => {
              const id = identityOf(m.identity);
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <Avatar name={m.profile.display_name} identity={m.identity} src={m.profile.avatar_url} size="sm" />
                  <span className="text-sm text-ink">{m.profile.display_name}</span>
                  <span className={`text-xs ${id.text}`}>{id.label}</span>
                  {m.role === 'owner' && <span className="text-[10px] text-ink-faint">· creó el cosmos</span>}
                </div>
              );
            })}
            {!partner && <p className="text-sm text-ink-faint">Esperando a la segunda persona…</p>}
          </div>
        </Card>

        {/* Notas */}
        <button
          type="button"
          onClick={() => navigate('/notes')}
          className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-surface px-4 py-3.5 text-left transition-colors hover:bg-surface-elevated"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blossom/10 text-blossom">
            <StickyNote className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <span className="block text-ink">Notas</span>
            <span className="block text-xs text-ink-faint">Inmediatas, programadas o selladas</span>
          </span>
          <ChevronRight className="h-4 w-4 text-ink-faint" />
        </button>

        {/* Nuestras otras apps */}
        <div>
          <p className="mb-2 px-1 text-xs uppercase tracking-widest text-ink-faint">Nuestras otras apps</p>
          <div className="space-y-2">
            {[
              {
                href: 'https://sofiaaos26.github.io/enediano-translator/',
                icon: Languages,
                title: 'Traductor de Enediano',
                desc: 'El idioma oficial de la República de Enede',
              },
              {
                href: 'https://sofiaaos26.github.io/whole-new-worlds/',
                icon: Music2,
                title: 'Whole New Worlds',
                desc: 'Nuestro universo musical',
              },
            ].map(({ href, icon: Icon, title, desc }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-surface px-4 py-3.5 text-left transition-colors hover:bg-surface-elevated"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blossom/10 text-blossom">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-ink">{title}</span>
                  <span className="block truncate text-xs text-ink-faint">{desc}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-faint" />
              </a>
            ))}
          </div>
        </div>

        {/* Invite (only while alone) */}
        {alone && (
          <GlassCard glow="blossom">
            <p className="text-xs uppercase tracking-widest text-ink-faint">Invitación</p>
            <p className="mt-1 mb-3 text-sm text-ink-soft">
              Comparte este código con la otra persona.
            </p>
            <button
              type="button"
              onClick={copyCode}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 px-5 py-3 font-display text-xl tracking-[0.3em] text-ink transition-colors hover:bg-black/40"
            >
              {code ?? '········'}
              {copied ? <Check className="h-5 w-5 text-aura" /> : <Copy className="h-4 w-4 text-ink-faint" />}
            </button>
          </GlassCard>
        )}

        {/* Sign out */}
        <Button variant="subtle" fullWidth onClick={() => setConfirmOut(true)}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>

        <p className="pt-4 text-center font-display text-xs italic text-ink-faint">
          COSMOS · our little universe.
        </p>
      </div>

      <ConfirmDialog
        open={confirmOut}
        onClose={() => setConfirmOut(false)}
        onConfirm={() => {
          setConfirmOut(false);
          void signOut();
        }}
        title="¿Cerrar sesión?"
        message="Tu universo sigue aquí cuando regreses."
        confirmLabel="Cerrar sesión"
      />
    </Screen>
  );
}
