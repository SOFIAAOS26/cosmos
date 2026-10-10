import { describe, it, expect } from 'vitest';
import { findSincronias, sincroniaStreak, SINCRONIA_WINDOW_MS } from './sincronia';
import type { Thought } from '@/types/database';

let n = 0;
function th(author: string, iso: string): Thought {
  return { id: `t${n++}`, cosmos_id: 'c', author_id: author, created_at: iso };
}

describe('findSincronias (§Hito8-B)', () => {
  it('pairs two different authors within the window', () => {
    const list = [th('a', '2026-10-10T10:00:00Z'), th('b', '2026-10-10T10:20:00Z')];
    expect(findSincronias(list)).toHaveLength(1);
  });

  it('does not pair the same author with themselves', () => {
    const list = [th('a', '2026-10-10T10:00:00Z'), th('a', '2026-10-10T10:05:00Z')];
    expect(findSincronias(list)).toHaveLength(0);
  });

  it('does not pair when more than 30 min apart', () => {
    const list = [th('a', '2026-10-10T10:00:00Z'), th('b', '2026-10-10T10:31:00Z')];
    expect(findSincronias(list)).toHaveLength(0);
  });

  it('consumes both of a matched pair (no over-counting a burst)', () => {
    const list = [
      th('a', '2026-10-10T10:00:00Z'),
      th('b', '2026-10-10T10:10:00Z'),
      th('a', '2026-10-10T10:15:00Z'),
    ];
    // a,b pair once; the trailing lone 'a' doesn't form a second
    expect(findSincronias(list)).toHaveLength(1);
  });

  it('is order-independent (sorts internally)', () => {
    const asc = [th('a', '2026-10-10T10:00:00Z'), th('b', '2026-10-10T10:10:00Z')];
    const desc = [th('b', '2026-10-10T10:10:00Z'), th('a', '2026-10-10T10:00:00Z')];
    expect(findSincronias(asc)).toEqual(findSincronias(desc));
  });

  it('uses exactly a 30-minute window', () => {
    expect(SINCRONIA_WINDOW_MS).toBe(30 * 60 * 1000);
  });
});

describe('sincroniaStreak (§Hito8-B)', () => {
  const day = 86_400_000;
  const now = Date.parse('2026-10-10T20:00:00Z');

  it('is 0 with no moments', () => {
    expect(sincroniaStreak([], now)).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    const moments = [now, now - day, now - 2 * day];
    expect(sincroniaStreak(moments, now)).toBe(3);
  });

  it('still counts when the most recent was yesterday', () => {
    const moments = [now - day, now - 2 * day];
    expect(sincroniaStreak(moments, now)).toBe(2);
  });

  it('breaks the streak on a missed day', () => {
    const moments = [now, now - 2 * day]; // missing yesterday
    expect(sincroniaStreak(moments, now)).toBe(1);
  });

  it('is 0 when the last sincronía is older than yesterday', () => {
    expect(sincroniaStreak([now - 3 * day], now)).toBe(0);
  });
});
