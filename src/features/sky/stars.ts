import type { Memory, Note, CosmosEvent, MemoryPaper, Comet } from '@/types/database';

/** The kinds of interaction that become a star (§Hito8-D). */
export type StarKind = 'memory' | 'paper' | 'comet' | 'event' | 'note' | 'sincronia';

export interface SkyStar {
  /** Stable, unique key: "kind:id". Used for positioning and constellations. */
  key: string;
  kind: StarKind;
  id: string;
  authorId: string | null;
  /** ms timestamp, for ordering. */
  at: number;
  label: string;
  /** Where tapping the star takes you, if anywhere. */
  route: string | null;
}

export interface StarStyle {
  /** Base radius in px. */
  r: number;
  /** How to draw it. */
  shape: 'star' | 'dot' | 'comet' | 'ring' | 'diamond' | 'twin';
  labelEs: string;
}

/** Visual language per kind — a recuerdo is a big star, a papelito a small one, etc. */
export const STAR_STYLE: Record<StarKind, StarStyle> = {
  memory: { r: 7, shape: 'star', labelEs: 'Recuerdo' },
  paper: { r: 3.5, shape: 'dot', labelEs: 'Papelito' },
  comet: { r: 4.5, shape: 'comet', labelEs: 'Cometa' },
  event: { r: 5.5, shape: 'ring', labelEs: 'Aventura' },
  note: { r: 4, shape: 'diamond', labelEs: 'Nota' },
  sincronia: { r: 6, shape: 'twin', labelEs: 'Sincronía' },
};

function hashKey(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic position for a star, in 0..1 of the sky, kept off the edges.
 * Pure in the key alone — so a star always sits in the same place, and a
 * constellation line keeps its shape even if its source is later deleted.
 */
export function starPosition(key: string): { x: number; y: number } {
  const rand = mulberry32(hashKey(key));
  const x = 0.08 + rand() * 0.84;
  const y = 0.1 + rand() * 0.78;
  return { x, y };
}

export interface SkySources {
  memories: Memory[];
  papers: MemoryPaper[];
  comets: Comet[];
  events: CosmosEvent[];
  notes: Note[];
  /** sincronía moments (ms timestamps) derived from thoughts. */
  sincronias: number[];
}

/** Build the full set of stars from every source, newest first. */
export function buildStars(src: Partial<SkySources>): SkyStar[] {
  const out: SkyStar[] = [];
  const push = (kind: StarKind, id: string, authorId: string | null, at: number, route: string | null) =>
    out.push({ key: `${kind}:${id}`, kind, id, authorId, at: Number.isFinite(at) ? at : 0, label: STAR_STYLE[kind].labelEs, route });

  for (const m of src.memories ?? []) push('memory', m.id, m.author_id, Date.parse(m.created_at), '/moments');
  for (const p of src.papers ?? []) push('paper', p.id, p.author_id, Date.parse(p.created_at), '/frasco');
  for (const c of src.comets ?? []) push('comet', c.id, c.author_id, Date.parse(c.created_at), '/comets');
  for (const e of src.events ?? []) push('event', e.id, e.created_by, Date.parse(e.created_at), '/future');
  for (const n of src.notes ?? []) push('note', n.id, n.author_id, Date.parse(n.created_at), '/notes');
  for (const ts of src.sincronias ?? []) push('sincronia', String(ts), null, ts, null);

  return out.sort((a, b) => b.at - a.at);
}
