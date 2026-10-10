import { describe, it, expect } from 'vitest';
import { buildPile, fillFraction, pickPaper } from './frascoLayout';
import type { MemoryPaper } from '@/types/database';

function paper(id: string, over: Partial<MemoryPaper> = {}): MemoryPaper {
  return {
    id,
    cosmos_id: 'c',
    author_id: 'a',
    recipient_id: null,
    message: 'hola',
    image_url: null,
    color: 'cream',
    intention: 'anytime',
    is_secret: false,
    opened_count: 0,
    last_opened_at: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...over,
  };
}

describe('frasco layout (§4/§5)', () => {
  it('is deterministic per paper id', () => {
    const papers = [paper('a'), paper('b'), paper('c')];
    const a = buildPile(papers);
    const b = buildPile(papers);
    expect(a).toEqual(b);
  });

  it('fills higher as the count grows', () => {
    expect(fillFraction(5)).toBeLessThan(fillFraction(30));
    expect(fillFraction(500)).toBeLessThanOrEqual(0.84);
  });
});

describe('pickPaper (§28)', () => {
  it('respects the intention filter', () => {
    const papers = [paper('a', { intention: 'laugh' }), paper('b', { intention: 'sad' })];
    const chosen = pickPaper(papers, { intention: 'sad' });
    expect(chosen?.id).toBe('b');
  });

  it('avoids immediately repeating when more than one exists', () => {
    const papers = [paper('a'), paper('b')];
    const chosen = pickPaper(papers, { excludeId: 'a' });
    expect(chosen?.id).toBe('b');
  });

  it('returns null for an empty jar', () => {
    expect(pickPaper([], {})).toBeNull();
  });
});

describe('pickPaper — new papers first (§28)', () => {
  it('always returns a never-opened paper while one exists', () => {
    const papers = [
      paper('old', { opened_count: 7 }),
      paper('new', { opened_count: 0 }),
    ];
    for (let i = 0; i < 25; i++) {
      expect(pickPaper(papers, {})?.id).toBe('new');
    }
  });

  it('respects the intention filter before prioritizing new ones', () => {
    const papers = [
      paper('new-laugh', { opened_count: 0, intention: 'laugh' }),
      paper('old-sad', { opened_count: 9, intention: 'sad' }),
    ];
    // Only 'sad' is asked for, so the new 'laugh' one must not jump the filter.
    expect(pickPaper(papers, { intention: 'sad' })?.id).toBe('old-sad');
  });

  it('falls back to weighted-random once every paper has been opened', () => {
    const papers = [paper('a', { opened_count: 2 }), paper('b', { opened_count: 5 })];
    const chosen = pickPaper(papers, {});
    expect(chosen).not.toBeNull();
    expect(['a', 'b']).toContain(chosen?.id);
  });
});
