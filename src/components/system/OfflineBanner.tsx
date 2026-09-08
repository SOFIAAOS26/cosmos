import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CloudOff } from 'lucide-react';

/** A quiet banner while the device is offline (§33). */
export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="fixed inset-x-0 top-0 z-[70] flex items-center justify-center gap-2 bg-surface-elevated/90 py-1.5 text-xs text-ink-soft backdrop-blur pt-[max(0.375rem,env(safe-area-inset-top))]"
        >
          <CloudOff className="h-3.5 w-3.5" />
          Sin conexión — tu universo sigue aquí
        </motion.div>
      )}
    </AnimatePresence>
  );
}
