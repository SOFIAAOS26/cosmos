import type { Thought } from '@/types/database';

/** Both thinking of each other within this window counts as a "sincronía" (§Hito8-B). */
export const SINCRONIA_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

const t = (iso: string) => Date.parse(iso);

/**
 * Pure: find sincronía moments from a list of thoughts. A sincronía is an
 * adjacent pair of thoughts from DIFFERENT authors within the window; once a
 * pair is matched both are consumed so a burst isn't over-counted. Returns the
 * timestamp (ms) of the later thought in each pair, ascending.
 */
export function findSincronias(thoughts: Thought[], windowMs = SINCRONIA_WINDOW_MS): number[] {
  const sorted = [...thoughts].sort((a, b) => t(a.created_at) - t(b.created_at));
  const out: number[] = [];
  let i = 0;
  while (i < sorted.length - 1) {
    const a = sorted[i]!;
    const b = sorted[i + 1]!;
    if (a.author_id !== b.author_id && t(b.created_at) - t(a.created_at) <= windowMs) {
      out.push(t(b.created_at));
      i += 2; // consume both
    } else {
      i += 1;
    }
  }
  return out;
}

const dayKey = (ms: number): string => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

/**
 * Pure: current streak of consecutive local days with at least one sincronía,
 * counting back from today (or yesterday, so a day isn't lost before the first
 * one of the day). 0 if the most recent sincronía is older than yesterday.
 */
export function sincroniaStreak(moments: number[], now: number = Date.now()): number {
  if (moments.length === 0) return 0;
  const days = new Set(moments.map(dayKey));
  const todayK = dayKey(now);
  const yesterdayK = dayKey(now - 86_400_000);
  if (!days.has(todayK) && !days.has(yesterdayK)) return 0;

  const cursor = new Date(now);
  if (!days.has(todayK)) cursor.setDate(cursor.getDate() - 1); // start from yesterday

  let streak = 0;
  while (days.has(dayKey(cursor.getTime()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
