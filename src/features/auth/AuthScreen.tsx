import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/brand/Logo';
import { Starfield } from '@/components/brand/Starfield';
import { Button, GlassCard, Input } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';

type Mode = 'signin' | 'signup';

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'Correo o contraseña incorrectos.';
  if (m.includes('already registered')) return 'Ese correo ya tiene una cuenta. Inicia sesión.';
  if (m.includes('password')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (m.includes('email')) return 'Revisa el correo que escribiste.';
  return 'Algo salió mal. Tu universo sigue aquí. Inténtalo otra vez.';
}

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email.trim(), password);
        setNotice('Cuenta creada. Si tu proyecto pide confirmación por correo, revísalo y vuelve.');
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-void px-5 py-10">
      <Starfield count={34} />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="mb-8 flex justify-center">
          <Logo size="md" withTagline />
        </div>

        <GlassCard padded>
          <h2 className="mb-1 font-display text-xl text-ink">
            {mode === 'signin' ? 'Bienvenido de vuelta' : 'Entra a tu universo'}
          </h2>
          <p className="mb-5 text-sm text-ink-soft">
            {mode === 'signin'
              ? 'Un pequeño universo para dos.'
              : 'Crea tu cuenta para empezar.'}
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Correo"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
            />
            <Input
              label="Contraseña"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              error={error ?? undefined}
            />
            {notice && <p className="text-sm text-aura">{notice}</p>}
            <Button type="submit" fullWidth size="lg" loading={loading}>
              {mode === 'signin' ? 'Entrar' : 'Crear cuenta'}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
              setError(null);
              setNotice(null);
            }}
            className="mt-5 w-full text-center text-sm text-ink-soft transition-colors hover:text-ink"
          >
            {mode === 'signin'
              ? '¿Primera vez? Crea tu cuenta'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </GlassCard>
      </motion.div>
    </div>
  );
}
