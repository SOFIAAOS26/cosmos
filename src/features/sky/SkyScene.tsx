import { useMemo } from 'react';
import { Starfield } from '@/components/brand/Starfield';
import { cn } from '@/utils/cn';
import { starPosition, STAR_STYLE, type SkyStar, type StarKind } from './stars';
import type { Constellation } from '@/types/database';
import type { Identity } from '@/theme/identity';

const TINT: Record<'noir' | 'blossom' | 'aura', string> = {
  noir: '#E4E4E7',
  blossom: '#F9A8D4',
  aura: '#67E8F9',
};

function tintFor(kind: StarKind, identity: Identity | null): string {
  if (kind === 'sincronia') return TINT.aura;
  if (identity === 'blossom') return TINT.blossom;
  if (identity === 'noir') return TINT.noir;
  return TINT.noir;
}

interface SkySceneProps {
  stars: SkyStar[];
  constellations: Constellation[];
  identityOf: (authorId: string | null) => Identity | null;
  connect: boolean;
  selected: string[];
  onStarClick: (star: SkyStar) => void;
}

export function SkyScene({ stars, constellations, identityOf, connect, selected, onStarClick }: SkySceneProps) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  // Points (0..100) for the in-progress selection line.
  const selectionPts = selected
    .map((k) => {
      const p = starPosition(k);
      return `${(p.x * 100).toFixed(2)},${(p.y * 100).toFixed(2)}`;
    })
    .join(' ');

  return (
    <div className="relative h-[68vh] min-h-[440px] w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0B0B13] via-[#0C0C16] to-[#07070C]">
      <Starfield count={40} className="opacity-50" />

      {/* Constellation + selection lines */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {constellations.map((c) => {
          const pts = c.stars
            .map((k) => {
              const p = starPosition(k);
              return `${(p.x * 100).toFixed(2)},${(p.y * 100).toFixed(2)}`;
            })
            .join(' ');
          return (
            <polyline
              key={c.id}
              points={pts}
              fill="none"
              stroke="rgba(249,168,212,0.35)"
              strokeWidth={0.3}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
        {connect && selected.length > 1 && (
          <polyline
            points={selectionPts}
            fill="none"
            stroke="rgba(103,232,249,0.8)"
            strokeWidth={0.4}
            strokeDasharray="1.4 1.2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {/* Constellation names near their centroid */}
      {constellations.map((c) => {
        if (c.stars.length === 0) return null;
        const cx = c.stars.reduce((s, k) => s + starPosition(k).x, 0) / c.stars.length;
        const cy = c.stars.reduce((s, k) => s + starPosition(k).y, 0) / c.stars.length;
        return (
          <span
            key={`name-${c.id}`}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-xs text-blossom-soft/80"
            style={{ left: `${cx * 100}%`, top: `${cy * 100}%` }}
          >
            {c.name}
          </span>
        );
      })}

      {/* Stars */}
      {stars.map((s) => {
        const { x, y } = starPosition(s.key);
        const style = STAR_STYLE[s.kind];
        const color = tintFor(s.kind, identityOf(s.authorId));
        const picked = selectedSet.has(s.key);
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => onStarClick(s)}
            aria-label={s.label}
            className={cn(
              'absolute -translate-x-1/2 -translate-y-1/2 outline-none transition-transform',
              connect && 'active:scale-110',
            )}
            style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
          >
            <StarGlyph kind={s.kind} r={style.r} color={color} picked={picked} />
          </button>
        );
      })}
    </div>
  );
}

function StarGlyph({ kind, r, color, picked }: { kind: StarKind; r: number; color: string; picked: boolean }) {
  const size = r * 2;
  const glow = `0 0 ${r * 2.4}px ${r * 0.7}px ${color}66`;
  const ring = picked ? { boxShadow: `0 0 0 2px ${TINT.aura}, ${glow}` } : { boxShadow: glow };

  if (kind === 'event') {
    return (
      <span
        className="block rounded-full"
        style={{ width: size, height: size, border: `1.5px solid ${color}`, ...ring }}
      />
    );
  }
  if (kind === 'note') {
    return (
      <span
        className="block rotate-45"
        style={{ width: size, height: size, background: color, borderRadius: 2, ...ring }}
      />
    );
  }
  if (kind === 'comet') {
    return (
      <span className="relative block" style={{ width: size, height: size }}>
        <span
          className="absolute right-1/2 top-1/2 h-[1.5px] origin-right"
          style={{ width: r * 4, background: `linear-gradient(90deg, transparent, ${color})`, transform: 'translateY(-50%) rotate(20deg)' }}
        />
        <span className="absolute inset-0 rounded-full" style={{ background: color, ...ring }} />
      </span>
    );
  }
  if (kind === 'sincronia') {
    return (
      <span className="relative block" style={{ width: size, height: size }}>
        <span className="absolute inset-0 rounded-full" style={{ background: color, ...ring }} />
        <span
          className="absolute inset-[-3px] rounded-full"
          style={{ border: `1px solid ${color}55` }}
        />
      </span>
    );
  }
  // memory (big) & paper (small) → disc; memory brighter
  return (
    <span
      className="block rounded-full"
      style={{
        width: size,
        height: size,
        background: kind === 'memory' ? '#FFFFFF' : color,
        ...ring,
      }}
    />
  );
}
