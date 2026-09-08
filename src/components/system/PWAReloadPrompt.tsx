import { useRegisterSW } from 'virtual:pwa-register/react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * PWA lifecycle prompts (§32): offer to reload when a new version is ready,
 * and a quiet "listo para usarse sin conexión" note the first time.
 */
export function PWAReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const show = offlineReady || needRefresh;
  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="glass fixed inset-x-4 bottom-[calc(var(--nav-height)+1rem)] z-[70] mx-auto flex max-w-sm items-center gap-3 rounded-2xl p-4 shadow-lift lg:bottom-6"
        >
          <div className="min-w-0 flex-1 text-sm text-ink">
            {needRefresh ? 'Hay una nueva versión de COSMOS.' : 'Listo para usarse sin conexión.'}
          </div>
          {needRefresh ? (
            <button
              type="button"
              onClick={() => updateServiceWorker(true)}
              className="shrink-0 rounded-full bg-blossom px-4 py-2 text-sm font-medium text-void"
            >
              Actualizar
            </button>
          ) : (
            <button
              type="button"
              onClick={close}
              className="shrink-0 rounded-full bg-white/10 px-4 py-2 text-sm text-ink"
            >
              Listo
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
