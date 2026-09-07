import type { NediState } from './NediState';

/**
 * Maps each Nedi state to its art asset + presentation.
 * We currently ship 5 renders; the remaining states reuse the nearest render.
 * Adding a dedicated asset later is a one-line change here.
 */
export interface NediStateConfig {
  /** Path under /public. */
  src: string;
  /** Whether this asset is already framed in a circular "badge". */
  framed?: boolean;
  /** Idle animation flavor. */
  motion: 'float' | 'still' | 'celebrate' | 'breathe';
  /** Alt text / accessible description. */
  alt: string;
}

const IDLE = '/nedi/idle.png';
const HAPPY = '/nedi/happy.png';
const CELEBRATING = '/nedi/celebrating.png';
const OBSERVING = '/nedi/observing.png';
const ERROR = '/nedi/error.png';

export const NEDI_CONFIG: Record<NediState, NediStateConfig> = {
  idle: { src: IDLE, motion: 'float', alt: 'Nedi, tranquilo' },
  happy: { src: HAPPY, motion: 'float', alt: 'Nedi, contento' },
  celebrating: { src: CELEBRATING, motion: 'celebrate', alt: 'Nedi celebrando' },
  thinking: { src: OBSERVING, framed: true, motion: 'breathe', alt: 'Nedi pensando' },
  observing: { src: OBSERVING, framed: true, motion: 'breathe', alt: 'Nedi observando' },
  sleeping: { src: IDLE, motion: 'still', alt: 'Nedi descansando' },
  curious: { src: OBSERVING, framed: true, motion: 'breathe', alt: 'Nedi con curiosidad' },
  supporting: { src: HAPPY, motion: 'float', alt: 'Nedi acompañando' },
  waiting: { src: IDLE, motion: 'float', alt: 'Nedi esperando' },
  error: { src: ERROR, motion: 'still', alt: 'Nedi confundido' },
};

/** All asset URLs — used to preload Nedi so states swap instantly. */
export const NEDI_ASSETS = [IDLE, HAPPY, CELEBRATING, OBSERVING, ERROR];
