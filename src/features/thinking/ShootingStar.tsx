import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

interface ShootingStarProps {
  show: boolean;
  onDone: () => void;
}

/**
 * Sincronía (§Hito8-B): when both thought of each other within 30 min, a comet
 * crosses the sky. A flourish, not a modal — it never traps taps and clears
 * itself. Reduced motion gets a soft caption instead of the streak.
 */
export function ShootingStar({ show, onDone }: ShootingStarProps) {
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    if (!show) return;
    const ms = reduce ? 1800 : 2200;
    const id = window.setTimeout(onDone, ms);
    return () => window.clearTimeout(id);
  }, [show, reduce, onDone]);

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[90] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-hidden
        >
          {!reduce && (
            <motion.div
              className="absolute left-[-12%] top-[12%]"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ x: '120vw', y: '52vh', opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.5, ease: 'easeIn', times: [0, 0.1, 0.75, 1] }}
            >
              {/* tail + head, angled along the travel direction */}
              <div className="relative" style={{ transform: 'rotate(23deg)' }}>
                <div
                  className="h-[2px] w-40 rounded-full"
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

          <motion.div
            className="absolute inset-x-0 top-[34%] flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: reduce ? 0 : 0.5, duration: 0.6 }}
          >
            <span className="font-display text-2xl text-ink">Sincronía</span>
            <span className="mt-1 text-sm text-ink-soft">Los dos pensaron en el otro.</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
