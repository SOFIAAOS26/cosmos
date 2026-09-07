import { useMemo } from 'react';
import { cn } from '@/utils/cn';

interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
  d: number;
}

/**
 * A quiet field of stars — the universe, suggested (§10).
 * Deterministic per mount, respects reduced-motion via CSS.
 */
export function Starfield({ count = 42, className }: { count?: number; className?: string }) {
  const stars = useMemo<Star[]>(() => {
    const out: Star[] = [];
    let seed = 7;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    for (let i = 0; i < count; i++) {
      out.push({
        x: rand() * 100,
        y: rand() * 100,
        r: rand() * 1.4 + 0.4,
        o: rand() * 0.5 + 0.15,
        d: rand() * 4 + 2,
      });
    }
    return out;
  }, [count]);

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-ink"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.r}px`,
            height: `${s.r}px`,
            opacity: s.o,
            animation: `twinkle ${s.d}s ease-in-out ${(i % 5) * 0.4}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
