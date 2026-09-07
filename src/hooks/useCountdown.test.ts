import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCountdown } from './useCountdown';

describe('useCountdown (§24 — always derived from the target date)', () => {
  it('computes whole days remaining', () => {
    const target = new Date(Date.now() + 12 * 86_400_000 + 3_600_000); // 12d 1h
    const { result } = renderHook(() => useCountdown(target, 'minute'));
    expect(result.current?.days).toBe(12);
    expect(result.current?.isPast).toBe(false);
  });

  it('flags a past target', () => {
    const target = new Date(Date.now() - 1000);
    const { result } = renderHook(() => useCountdown(target));
    expect(result.current?.isPast).toBe(true);
    expect(result.current?.total).toBe(0);
  });

  it('returns null when there is no target', () => {
    const { result } = renderHook(() => useCountdown(null));
    expect(result.current).toBeNull();
  });
});
