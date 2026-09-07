import { describe, it, expect } from 'vitest';
import { buildMonthMatrix, instantToKey, todayKey, keyToDate } from './date';

describe('date utilities (§55 timezone discipline)', () => {
  it('derives a stable date-key in a given timezone', () => {
    // 2026-01-01T05:30:00Z is still 2025-12-31 in America/Monterrey (UTC-6).
    expect(instantToKey('2026-01-01T05:30:00Z', 'America/Monterrey')).toBe('2025-12-31');
    // ...but already 2026-01-01 in UTC.
    expect(instantToKey('2026-01-01T05:30:00Z', 'UTC')).toBe('2026-01-01');
  });

  it('todayKey returns a YYYY-MM-DD string', () => {
    expect(todayKey('UTC')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('keyToDate round-trips the calendar day', () => {
    const d = keyToDate('2026-09-07');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(8); // September (0-indexed)
    expect(d.getDate()).toBe(7);
  });

  it('builds a Monday-first 6-week month matrix', () => {
    const matrix = buildMonthMatrix(new Date(2026, 8, 15), '2026-09-07');
    expect(matrix).toHaveLength(42);
    // First cell is a Monday.
    expect(matrix[0]!.date.getDay()).toBe(1);
    // Today is flagged exactly once.
    expect(matrix.filter((c) => c.isToday)).toHaveLength(1);
    // September has 30 days in-month.
    expect(matrix.filter((c) => c.inMonth)).toHaveLength(30);
  });
});
