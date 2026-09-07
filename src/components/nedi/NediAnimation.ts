import type { Variants } from 'framer-motion';
import type { NediStateConfig } from './nedi.config';

/** Idle-motion variants per flavor. Small, natural, never distracting (§5, §38). */
export const NEDI_MOTION: Record<NediStateConfig['motion'], Variants> = {
  float: {
    animate: {
      y: [0, -6, 0],
      transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  breathe: {
    animate: {
      scale: [1, 1.03, 1],
      transition: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  celebrate: {
    animate: {
      y: [0, -10, 0],
      rotate: [0, -3, 3, 0],
      transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  still: {
    animate: { y: 0 },
  },
};

/** Entrance used when Nedi appears in a scene. */
export const nediEnter: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 220, damping: 20 },
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};
