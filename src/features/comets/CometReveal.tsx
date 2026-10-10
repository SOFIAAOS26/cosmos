import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { CometCard } from './CometCard';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import type { Comet } from '@/types/database';

interface CometRevealProps {
  comet: Comet | null;
  authorName?: string;
  open: boolean;
  onClose: () => void;
}

/**
 * A comet arrives: a streak crosses the dark, then unfolds into the message
 * (§Hito8-C). Auto-shown when an unseen comet is waiting on app open.
 */
export function CometReveal({ comet, authorName, open, onClose }: CometRevealProps) {
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    if (open) navigator.vibrate?.([8, 30, 8]);
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && comet && (
        <motion.div
          className="fixed inset-0 z-[85] flex flex-col items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: 'rgba(8,8,12,0.9)', backdropFilter: 'blur(12px)' }}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/5 text-ink-soft transition-colors hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>

          {/* The incoming streak */}
          {!reduce && (
            <motion.div
              className="pointer-events-none absolute left-[-10%] top-[16%]"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ x: '116vw', y: '30vh', opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.1, ease: 'easeIn', times: [0, 0.15, 0.7, 1] }}
            >
              <div style={{ transform: 'rotate(18deg)' }} className="relative">
                <div
                  className="h-[2px] w-36 rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(103,232,249,0) 0%, rgba(249,168,212,0.5) 60%, rgba(255,255,255,0.95) 100%)',
                  }}
                />
                <div
                  className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white"
                  style={{ boxShadow: '0 0 14px 4px rgba(249,168,212,0.8)' }}
                />
              </div>
            </motion.div>
          )}

          {/* The message unfolds */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: reduce ? 0 : 0.55, type: 'spring', stiffness: 220, damping: 22 }}
            className="flex w-full flex-col items-center"
          >
            <CometCard comet={comet} authorName={authorName} />
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-full bg-blossom px-6 py-2.5 text-sm font-medium text-void shadow-blossom"
            >
              Guardar entre nosotros
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
