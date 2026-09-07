import { useEffect, useMemo, useState } from 'react';

export interface CountdownParts {
  total: number; // ms remaining (>= 0)
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function diff(target: number): CountdownParts {
  const now = Date.now();
  const total = Math.max(0, target - now);
  const isPast = target - now <= 0;
  const days = Math.floor(total / 86_400_000);
  const hours = Math.floor((total % 86_400_000) / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);
  return { total, days, hours, minutes, seconds, isPast };
}

/**
 * A live countdown to a target instant (§24).
 * Computes remaining time from the target date — never stores a "days" number.
 * Ticks per second by default; pass `tick="minute"` for cheaper large countdowns.
 */
export function useCountdown(target: Date | string | number | null, tick: 'second' | 'minute' = 'second'): CountdownParts | null {
  const targetMs = useMemo(() => {
    if (target == null) return null;
    if (typeof target === 'number') return target;
    if (typeof target === 'string') return new Date(target).getTime();
    return target.getTime();
  }, [target]);

  const [, setNow] = useState(0);

  useEffect(() => {
    if (targetMs == null) return;
    const interval = tick === 'minute' ? 30_000 : 1000;
    const id = window.setInterval(() => setNow((n) => n + 1), interval);
    return () => window.clearInterval(id);
  }, [targetMs, tick]);

  if (targetMs == null) return null;
  return diff(targetMs);
}
