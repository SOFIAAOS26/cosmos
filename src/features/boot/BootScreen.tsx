import { motion } from 'framer-motion';
import { Logo } from '@/components/brand/Logo';
import { Starfield } from '@/components/brand/Starfield';

/**
 * The opening of the universe (§68).
 * Dark screen -> a small light -> COSMOS -> our little universe.
 * Slow but brief. Not a gratuitous loading screen.
 */
export function BootScreen() {
  return (
    <div className="relative flex h-dvh w-full items-center justify-center overflow-hidden bg-void">
      <Starfield count={36} />

      {/* A single small light blooming at center */}
      <motion.div
        className="pointer-events-none absolute h-40 w-40 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(249,168,212,0.35), transparent 70%)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.6, 1.2], opacity: [0, 0.9, 0.5] }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      />

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10"
      >
        <Logo size="lg" withTagline />
      </motion.div>
    </div>
  );
}
