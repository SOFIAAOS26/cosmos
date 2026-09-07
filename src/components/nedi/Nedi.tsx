import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { NediState } from './NediState';
import { NEDI_CONFIG } from './nedi.config';
import { NEDI_MOTION, nediEnter } from './NediAnimation';

export interface NediProps {
  state?: NediState;
  /** Pixel height of Nedi. Keep him small — he's a detail, not the star (§5). */
  size?: number;
  className?: string;
  /** Soft aura glow behind Nedi. */
  glow?: boolean;
  /** Play the entrance animation. Default true. */
  enter?: boolean;
}

/**
 * Nedi — the rendered character. Purely visual; he holds no logic.
 * A caller decides *when* Nedi appears (that's the discipline in §5/§67).
 */
export function Nedi({ state = 'idle', size = 120, className, glow = false, enter = true }: NediProps) {
  const cfg = NEDI_CONFIG[state];
  const motionVariant = NEDI_MOTION[cfg.motion];

  return (
    <motion.div
      className={cn('relative inline-flex items-end justify-center', className)}
      style={{ height: size }}
      variants={enter ? nediEnter : undefined}
      initial={enter ? 'hidden' : false}
      animate={enter ? 'show' : false}
      exit={enter ? 'exit' : undefined}
    >
      {glow && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0 animate-aura-pulse rounded-full"
          style={{
            background:
              'radial-gradient(circle at 50% 45%, rgba(103,232,249,0.28), transparent 65%)',
            transform: 'scale(1.4)',
          }}
        />
      )}
      <motion.img
        src={cfg.src}
        alt={cfg.alt}
        draggable={false}
        loading="lazy"
        variants={motionVariant}
        animate="animate"
        className={cn('relative z-10 h-full w-auto object-contain', cfg.framed && 'drop-shadow-lg')}
        style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.5))' }}
      />
    </motion.div>
  );
}
