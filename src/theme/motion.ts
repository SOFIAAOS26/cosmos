import type { Transition, Variants } from 'framer-motion';

/**
 * COSMOS motion grammar.
 * Three tiers — micro / standard / emotional. Keep it short and natural.
 * Section 38 of the master prompt.
 */
export const DURATION = {
  micro: 0.14, // 100–180ms — taps, toggles
  standard: 0.24, // 180–300ms — sheets, cards, transitions
  emotional: 0.5, // 300–600ms — reveals, celebrations, boot
} as const;

export const EASE = {
  cosmos: [0.22, 1, 0.36, 1] as [number, number, number, number],
} as const;

export const spring = {
  soft: { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 } satisfies Transition,
  gentle: { type: 'spring', stiffness: 180, damping: 26 } satisfies Transition,
  sheet: { type: 'spring', stiffness: 320, damping: 34 } satisfies Transition,
  pop: { type: 'spring', stiffness: 420, damping: 20 } satisfies Transition,
} as const;

/** Fade + rise, the default entrance for content. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.standard, ease: EASE.cosmos },
  },
  exit: { opacity: 0, y: 6, transition: { duration: DURATION.micro, ease: EASE.cosmos } },
};

/** Stagger container for lists of rising items. */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};

/** Bottom sheet slide-up. */
export const sheetVariants: Variants = {
  hidden: { y: '100%' },
  show: { y: 0, transition: spring.sheet },
  exit: { y: '100%', transition: { duration: DURATION.standard, ease: EASE.cosmos } },
};

/** Backdrop dim. */
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.standard } },
  exit: { opacity: 0, transition: { duration: DURATION.micro } },
};

/** Route/page transition. */
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.standard, ease: EASE.cosmos } },
  exit: { opacity: 0, y: -4, transition: { duration: DURATION.micro, ease: EASE.cosmos } },
};
