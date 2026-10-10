import { describe, it, expect } from 'vitest';
import { buildStars, starPosition, STAR_STYLE, type StarKind } from './stars';
import type { Memory, MemoryPaper, Comet, CosmosEvent, Note } from '@/types/database';

const mem = (id: string, at: string): Memory => ({
  id, cosmos_id: 'c', date: '2026-01-01', author_id: 'a', photo_url: null, story: null,
  created_at: at, updated_at: at,
});
const paper = (id: string, at: string): MemoryPaper => ({
  id, cosmos_id: 'c', author_id: 'b', recipient_id: null, message: 'm', image_url: null,
  color: 'cream', intention: 'anytime', is_secret: false, opened_count: 0, last_opened_at: null,
  created_at: at, updated_at: at,
});
const comet = (id: string, at: string): Comet => ({
  id, cosmos_id: 'c', author_id: 'a', recipient_id: 'b', note: 'n', image_url: null, link_url: null,
  seen_at: null, created_at: at, updated_at: at,
});
const evt = (id: string, at: string): CosmosEvent => ({
  id, cosmos_id: 'c', title: 'T', date: '2026-02-02', time: null, location: null, latitude: null,
  longitude: null, description: null, type: 'date', created_by: 'b', created_at: at, updated_at: at,
});
const note = (id: string, at: string): Note => ({
  id, cosmos_id: 'c', author_id: 'a', recipient_id: null, kind: 'immediate', title: null, body: 'x',
  unlock_at: null, opened_at: null, created_at: at, updated_at: at,
});

describe('starPosition (§Hito8-D)', () => {
  it('is deterministic per key', () => {
    expect(starPosition('memory:1')).toEqual(starPosition('memory:1'));
  });
  it('stays within the padded sky bounds', () => {
    for (const k of ['memory:1', 'paper:2', 'comet:3', 'sincronia:1699999999999', 'note:z']) {
      const p = starPosition(k);
      expect(p.x).toBeGreaterThanOrEqual(0.08);
      expect(p.x).toBeLessThanOrEqual(0.92);
      expect(p.y).toBeGreaterThanOrEqual(0.1);
      expect(p.y).toBeLessThanOrEqual(0.88);
    }
  });
  it('spreads different keys to different spots', () => {
    const a = starPosition('memory:1');
    const b = starPosition('memory:2');
    expect(a).not.toEqual(b);
  });
});

describe('buildStars (§Hito8-D)', () => {
  it('maps every source kind and keys them uniquely', () => {
    const stars = buildStars({
      memories: [mem('m1', '2026-03-01T00:00:00Z')],
      papers: [paper('p1', '2026-03-02T00:00:00Z')],
      comets: [comet('c1', '2026-03-03T00:00:00Z')],
      events: [evt('e1', '2026-03-04T00:00:00Z')],
      notes: [note('n1', '2026-03-05T00:00:00Z')],
      sincronias: [Date.parse('2026-03-06T00:00:00Z')],
    });
    const kinds = stars.map((s) => s.kind).sort();
    expect(kinds).toEqual(['comet', 'event', 'memory', 'note', 'paper', 'sincronia']);
    expect(new Set(stars.map((s) => s.key)).size).toBe(6);
  });

  it('sorts newest first', () => {
    const stars = buildStars({
      memories: [mem('old', '2026-01-01T00:00:00Z'), mem('new', '2026-12-01T00:00:00Z')],
    });
    expect(stars[0]!.id).toBe('new');
  });

  it('carries author and route, null author for sincronía', () => {
    const stars = buildStars({ sincronias: [1000], memories: [mem('m', '2026-01-01T00:00:00Z')] });
    const sinc = stars.find((s) => s.kind === 'sincronia')!;
    const m = stars.find((s) => s.kind === 'memory')!;
    expect(sinc.authorId).toBeNull();
    expect(sinc.route).toBeNull();
    expect(m.authorId).toBe('a');
    expect(m.route).toBe('/moments');
  });

  it('has a style for every kind', () => {
    const kinds: StarKind[] = ['memory', 'paper', 'comet', 'event', 'note', 'sincronia'];
    for (const k of kinds) expect(STAR_STYLE[k].r).toBeGreaterThan(0);
  });

  it('is empty with no sources', () => {
    expect(buildStars({})).toEqual([]);
  });
});
