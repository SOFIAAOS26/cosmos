import { Starfield } from '@/components/brand/Starfield';
import { Logo } from '@/components/brand/Logo';
import { GlassCard } from '@/components/ui';

/**
 * Shown when Supabase env vars are missing — a friendly first-run guide
 * instead of a white crash.
 */
export function SetupScreen() {
  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-void px-5 py-10">
      <Starfield count={30} />
      <GlassCard className="relative z-10 w-full max-w-md" padded>
        <div className="mb-6 flex justify-center">
          <Logo size="md" withTagline />
        </div>
        <h2 className="mb-2 font-display text-xl text-ink">Casi listo</h2>
        <p className="mb-4 text-sm leading-relaxed text-ink-soft">
          COSMOS necesita conectarse a tu proyecto de Supabase. Crea un archivo{' '}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-ink">.env</code> en la raíz con:
        </p>
        <pre className="mb-4 overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-ink-soft">
{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key`}
        </pre>
        <p className="text-sm text-ink-faint">
          Copia <code className="rounded bg-white/10 px-1 py-0.5">.env.example</code> como punto de
          partida y reinicia el servidor de desarrollo.
        </p>
      </GlassCard>
    </div>
  );
}
