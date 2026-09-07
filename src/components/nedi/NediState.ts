/**
 * Nedi — a small inhabitant of the COSMOS universe (§3–§7, §67).
 * Ambient, emotional, contextual. Never a chatbot, never dominating the UI.
 *
 * The full expressive vocabulary. Each state maps to an available art asset
 * in nedi.config.ts, so new art can be added later without touching callers.
 */
export type NediState =
  | 'idle'
  | 'happy'
  | 'celebrating'
  | 'thinking'
  | 'observing'
  | 'sleeping'
  | 'curious'
  | 'supporting'
  | 'waiting'
  | 'error';

export const NEDI_STATES: NediState[] = [
  'idle',
  'happy',
  'celebrating',
  'thinking',
  'observing',
  'sleeping',
  'curious',
  'supporting',
  'waiting',
  'error',
];
