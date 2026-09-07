import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Sparkles, UserPlus } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Starfield } from '@/components/brand/Starfield';
import { Nedi } from '@/components/nedi';
import { Button, GlassCard, Input } from '@/components/ui';
import { IdentityPicker } from './IdentityPicker';
import { useAuth } from '@/providers/AuthProvider';
import { useCosmos } from '@/providers/CosmosProvider';
import { getSupabase } from '@/lib/supabase';
import { env } from '@/lib/env';
import type { Identity } from '@/theme/identity';
import { pageVariants } from '@/theme/motion';

type Step = 'welcome' | 'create' | 'join';

export function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const { createCosmos, joinCosmos } = useCosmos();
  const [step, setStep] = useState<Step>('welcome');

  const [name, setName] = useState('');
  const [cosmosName, setCosmosName] = useState('');
  const [code, setCode] = useState('');
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveProfile() {
    if (!user) return;
    const supabase = getSupabase();
    const { error: e } = await supabase
      .from('profiles')
      .update({ display_name: name.trim() || 'Alguien', identity: identity ?? 'noir' })
      .eq('id', user.id);
    if (e) throw e;
    await refreshProfile();
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (loading || !identity) return;
    setLoading(true);
    setError(null);
    try {
      await saveProfile();
      await createCosmos(cosmosName.trim() || 'Nuestro cosmos', identity, env.defaultTimezone);
      // Cosmos now exists -> the app shell takes over; first-run invite lives there.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el cosmos.');
      setLoading(false);
    }
  }

  async function onJoin(e: FormEvent) {
    e.preventDefault();
    if (loading || !identity) return;
    setLoading(true);
    setError(null);
    try {
      await saveProfile();
      await joinCosmos(code, identity);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo unir al cosmos.';
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-void px-5 py-10">
      <Starfield count={32} />

      <div className="relative z-10 w-full max-w-sm">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              variants={pageVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex flex-col items-center"
            >
              <Nedi state="happy" size={140} glow />
              <div className="mt-4 mb-10">
                <Logo size="md" withTagline />
              </div>
              <div className="w-full space-y-3">
                <Button size="lg" fullWidth onClick={() => setStep('create')}>
                  <Sparkles className="h-5 w-5" />
                  Crear nuestro cosmos
                </Button>
                <Button size="lg" variant="subtle" fullWidth onClick={() => setStep('join')}>
                  <UserPlus className="h-5 w-5" />
                  Unirme a un cosmos
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'create' && (
            <motion.div key="create" variants={pageVariants} initial="hidden" animate="show" exit="exit">
              <BackButton onClick={() => setStep('welcome')} />
              <GlassCard padded className="mt-3">
                <h2 className="mb-1 font-display text-xl text-ink">Crea tu cosmos</h2>
                <p className="mb-5 text-sm text-ink-soft">Un pequeño universo para los dos.</p>
                <form onSubmit={onCreate} className="space-y-5">
                  <Input
                    label="Nombre del cosmos"
                    value={cosmosName}
                    onChange={(e) => setCosmosName(e.target.value)}
                    placeholder="Nuestro cosmos"
                  />
                  <Input
                    label="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="¿Cómo te llamas?"
                    required
                  />
                  <div>
                    <p className="mb-2 text-sm font-medium text-ink-soft">Tu identidad</p>
                    <IdentityPicker value={identity} onChange={setIdentity} />
                  </div>
                  {error && <p className="text-sm text-blossom-soft">{error}</p>}
                  <Button type="submit" size="lg" fullWidth loading={loading} disabled={!identity}>
                    Crear cosmos
                  </Button>
                </form>
              </GlassCard>
            </motion.div>
          )}

          {step === 'join' && (
            <motion.div key="join" variants={pageVariants} initial="hidden" animate="show" exit="exit">
              <BackButton onClick={() => setStep('welcome')} />
              <GlassCard padded className="mt-3">
                <h2 className="mb-1 font-display text-xl text-ink">Únete a un cosmos</h2>
                <p className="mb-5 text-sm text-ink-soft">
                  Escribe el código que te compartieron.
                </p>
                <form onSubmit={onJoin} className="space-y-5">
                  <Input
                    label="Código de invitación"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="XXXXXXXX"
                    autoCapitalize="characters"
                    className="text-center text-lg tracking-[0.3em]"
                    required
                  />
                  <Input
                    label="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="¿Cómo te llamas?"
                    required
                  />
                  <div>
                    <p className="mb-2 text-sm font-medium text-ink-soft">Tu identidad</p>
                    <IdentityPicker value={identity} onChange={setIdentity} />
                  </div>
                  {error && <p className="text-sm text-blossom-soft">{error}</p>}
                  <Button type="submit" size="lg" fullWidth loading={loading} disabled={!identity}>
                    Entrar al cosmos
                  </Button>
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
    >
      <ArrowLeft className="h-4 w-4" />
      Atrás
    </button>
  );
}
