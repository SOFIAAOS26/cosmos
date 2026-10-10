import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { Spinner } from '@/components/ui';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { CometWatcher } from '@/features/comets/CometWatcher';

// Route-level code splitting (§34): only the Observatory ships in the initial
// bundle; other areas load on demand.
const Observatory = lazy(() =>
  import('@/features/observatory/Observatory').then((m) => ({ default: m.Observatory })),
);
const CalendarScreen = lazy(() =>
  import('@/features/calendar/CalendarScreen').then((m) => ({ default: m.CalendarScreen })),
);
const MomentsScreen = lazy(() =>
  import('@/features/moments/MomentsScreen').then((m) => ({ default: m.MomentsScreen })),
);
const FutureScreen = lazy(() =>
  import('@/features/future/FutureScreen').then((m) => ({ default: m.FutureScreen })),
);
const MoreScreen = lazy(() =>
  import('@/features/more/MoreScreen').then((m) => ({ default: m.MoreScreen })),
);
const NotesScreen = lazy(() =>
  import('@/features/notes/NotesScreen').then((m) => ({ default: m.NotesScreen })),
);
const FrascoScreen = lazy(() =>
  import('@/features/frasco/FrascoScreen').then((m) => ({ default: m.FrascoScreen })),
);
const CometsScreen = lazy(() =>
  import('@/features/comets/CometsScreen').then((m) => ({ default: m.CometsScreen })),
);
const SkyScreen = lazy(() =>
  import('@/features/sky/SkyScreen').then((m) => ({ default: m.SkyScreen })),
);

function ScreenFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Spinner className="h-6 w-6" />
    </div>
  );
}

export function AppShell() {
  const isDesktop = useIsDesktop();
  const location = useLocation();

  return (
    <div className="relative flex min-h-dvh w-full bg-void">
      {isDesktop && <Sidebar />}

      <main className="relative flex-1 min-w-0">
        <Suspense fallback={<ScreenFallback />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Observatory />} />
              <Route path="/calendar" element={<CalendarScreen />} />
              <Route path="/moments" element={<MomentsScreen />} />
              <Route path="/frasco" element={<FrascoScreen />} />
              <Route path="/comets" element={<CometsScreen />} />
              <Route path="/sky" element={<SkyScreen />} />
              <Route path="/future" element={<FutureScreen />} />
              <Route path="/more" element={<MoreScreen />} />
              <Route path="/notes" element={<NotesScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      {!isDesktop && <BottomNav />}

      {/* Comets unfold on open and in realtime, on any screen (§Hito8-C). */}
      <CometWatcher />
    </div>
  );
}
