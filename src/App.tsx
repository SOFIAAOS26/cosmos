import { useEffect, useState } from 'react';
import { hasSupabaseConfig } from '@/lib/supabase';
import { ToastProvider } from '@/providers/ToastProvider';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { CosmosProvider, useCosmos } from '@/providers/CosmosProvider';
import { BootScreen } from '@/features/boot/BootScreen';
import { SetupScreen } from '@/features/setup/SetupScreen';
import { AuthScreen } from '@/features/auth/AuthScreen';
import { Onboarding } from '@/features/onboarding/Onboarding';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorBoundary } from '@/components/system/ErrorBoundary';
import { PWAReloadPrompt } from '@/components/system/PWAReloadPrompt';
import { OfflineBanner } from '@/components/system/OfflineBanner';
import { NEDI_ASSETS } from '@/components/nedi';

/** Preload Nedi art so his states swap instantly. */
function usePreloadNedi() {
  useEffect(() => {
    NEDI_ASSETS.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);
}

function Gate() {
  const { ready, session, profileLoaded } = useAuth();
  const { loaded, cosmos } = useCosmos();
  const [minBootDone, setMinBootDone] = useState(false);
  usePreloadNedi();

  useEffect(() => {
    const t = window.setTimeout(() => setMinBootDone(true), 1700);
    return () => window.clearTimeout(t);
  }, []);

  // The opening of the universe — held briefly, then resolves.
  if (!ready || !minBootDone) return <BootScreen />;
  if (!session) return <AuthScreen />;
  if (!profileLoaded || !loaded) return <BootScreen />;
  if (!cosmos) return <Onboarding />;
  return <AppShell />;
}

export function App() {
  if (!hasSupabaseConfig()) return <SetupScreen />;
  return (
    <ErrorBoundary>
      <OfflineBanner />
      <ToastProvider>
        <AuthProvider>
          <CosmosProvider>
            <Gate />
          </CosmosProvider>
        </AuthProvider>
      </ToastProvider>
      <PWAReloadPrompt />
    </ErrorBoundary>
  );
}
