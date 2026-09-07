import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { Observatory } from '@/features/observatory/Observatory';
import { CalendarScreen } from '@/features/calendar/CalendarScreen';
import { MomentsScreen } from '@/features/moments/MomentsScreen';
import { FutureScreen } from '@/features/future/FutureScreen';
import { MoreScreen } from '@/features/more/MoreScreen';
import { NotesScreen } from '@/features/notes/NotesScreen';

export function AppShell() {
  const isDesktop = useIsDesktop();
  const location = useLocation();

  return (
    <div className="relative flex min-h-dvh w-full bg-void">
      {isDesktop && <Sidebar />}

      <main className="relative flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Observatory />} />
            <Route path="/calendar" element={<CalendarScreen />} />
            <Route path="/moments" element={<MomentsScreen />} />
            <Route path="/future" element={<FutureScreen />} />
            <Route path="/more" element={<MoreScreen />} />
            <Route path="/notes" element={<NotesScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {!isDesktop && <BottomNav />}
    </div>
  );
}
