import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

/**
 * A very light "destello" in the sky when a thought happens (§Hito8-B) — a
 * single star blooms and fades near the top. Keyed by `pulse` so each new
 * thought restarts it. Purely ambient; never blocks taps.
 */
export function SkyPulse({ pulse }: { pulse: number }) {
  const reduce = usePrefersReducedMotion();
  if (reduce || pulse === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 overflow-visible" aria-hidden>
      <AnimatePresence>
        <motion.span
          key={pulse}
          className="absolute left-1/2 top-6 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1.6, 2.4] }}
          transition={{ duration: 2.2, ease: 'easeOut' }}
          style={{ boxShadow: '0 0 16px 5px rgba(249,168,212,0.55)' }}
        />
      </AnimatePresence>
    </div>
  );
}
