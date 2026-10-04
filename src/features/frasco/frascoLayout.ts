import type { MemoryPaper } from '@/types/database';
import type { PaperColor, PaperIntention } from '@/types/models';

/**
 * Deterministic pile layout for the papers inside the jar (§4, §5).
 * Positions are stable per paper id (no reshuffle on every render) and the pile
 * grows taller as the couple saves more — a few get partially hidden when many.
 */
export interface PaperSlot {
  id: string;
  color: PaperColor;
  /** Horizontal center, 0..1 of the jar body width. */
  x: number;
  /** Distance from the body floor, 0..1 of the usable height. */
  y: number;
  /** Rotation in degrees. */
  rot: number;
  /** Stacking order (older behind, newer in front). */
  z: number;
}

/** Cap how many papers we actually render inside the glass (perf §18). */
export const JAR_RENDER_CAP = 64;

function hashString(s: string): number {
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

/** Fraction of the body height the pile should occupy for a given count. */
export function fillFraction(count: number): number {
  return Math.min(0.84, 0.14 + count * 0.016);
}

export function buildPile(papers: MemoryPaper[]): PaperSlot[] {
  const total = papers.length;
  if (total === 0) return [];
  const rendered = papers.slice(-JAR_RENDER_CAP); // keep the most recent when very full
  const n = rendered.length;
  const pileTop = fillFraction(total);

  return rendered.map((p, i) => {
    const rand = mulberry32(hashString(p.id));
    // Oldest sit near the floor, newest ride higher in the pile.
    const level = n === 1 ? 0 : i / (n - 1);
    const y = Math.min(0.96, level * pileTop + (rand() - 0.5) * 0.08 + 0.02);
    const x = 0.5 + (rand() - 0.5) * 0.52; // spread across, kept off the glass walls
    const rot = (rand() - 0.5) * 42;
    return { id: p.id, color: p.color, x: Math.min(0.9, Math.max(0.1, x)), y, rot, z: i };
  });
}

/**
 * Choose a paper to open (§28): respect an intention filter, avoid immediately
 * repeating the last one, and gently favor papers opened fewer times — no heavy
 * algorithm. Secret papers the viewer can't see are already filtered by RLS.
 * (Pure function — kept out of api.ts so it imports no Supabase client.)
 */
export function pickPaper(
  papers: MemoryPaper[],
  opts: { intention?: PaperIntention | null; excludeId?: string | null } = {},
): MemoryPaper | null {
  let pool = papers;
  if (opts.intention) pool = pool.filter((p) => p.intention === opts.intention);
  if (pool.length === 0) pool = papers;
  if (pool.length === 0) return null;

  let candidates = pool;
  if (opts.excludeId && pool.length > 1) {
    candidates = pool.filter((p) => p.id !== opts.excludeId);
  }

  const weights = candidates.map((p) => 1 / (1 + p.opened_count));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return candidates[i]!;
  }
  return candidates[candidates.length - 1]!;
}
