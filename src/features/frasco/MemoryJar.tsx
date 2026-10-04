import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { paperColorStyle } from '@/types/models';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { buildPile } from './frascoLayout';
import type { MemoryPaper } from '@/types/database';

interface MemoryJarProps {
  papers: MemoryPaper[];
  /** Body width in px. Body height ≈ 1.3×. */
  width?: number;
  lidOpen?: boolean;
  /** Brighten the inner light (during the opening ritual). */
  glow?: boolean;
  onTap?: () => void;
  className?: string;
}

/**
 * The jar — a translucent glass vessel holding the couple's folded papers.
 * Pure CSS + SVG + Framer Motion, no 3D (§3, §18). It fills as papers grow.
 */
export function MemoryJar({ papers, width = 240, lidOpen, glow, onTap, className }: MemoryJarProps) {
  const reduce = usePrefersReducedMotion();
  const bodyW = width;
  const bodyH = Math.round(width * 1.3);
  const neckW = Math.round(width * 0.5);
  const neckH = Math.round(width * 0.12);
  const corkW = Math.round(width * 0.56);
  const corkH = Math.round(width * 0.14);
  const pad = Math.round(width * 0.09);
  const paperW = Math.round(width * 0.3);
  const paperH = Math.round(paperW * 0.62);

  const pile = useMemo(() => buildPile(papers), [papers]);

  const usableW = bodyW - pad * 2 - paperW;
  const usableH = bodyH - pad * 2 - paperH;

  return (
    <div
      className={cn('relative flex flex-col items-center', className)}
      style={{ width: bodyW }}
      role={onTap ? 'button' : undefined}
      tabIndex={onTap ? 0 : undefined}
      onClick={onTap}
      onKeyDown={(e) => onTap && (e.key === 'Enter' || e.key === ' ') && onTap()}
      aria-label={onTap ? 'El frasco de nosotros' : undefined}
    >
      {/* Ambient glow behind the jar */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 -translate-x-1/2 rounded-full"
        style={{
          width: bodyW * 1.5,
          height: bodyW * 1.5,
          background:
            'radial-gradient(circle, rgba(249,168,212,0.18), rgba(103,232,249,0.08) 45%, transparent 70%)',
        }}
        animate={reduce ? undefined : { opacity: glow ? 0.95 : [0.5, 0.7, 0.5], scale: glow ? 1.12 : 1 }}
        transition={{ duration: glow ? 0.6 : 6, repeat: glow ? 0 : Infinity, ease: 'easeInOut' }}
      />

      {/* Cork / lid */}
      <motion.div
        aria-hidden
        className="relative z-20"
        style={{ width: corkW, height: corkH }}
        animate={reduce ? undefined : { y: lidOpen ? -corkH * 1.3 : 0, rotate: lidOpen ? -12 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        <div
          className="h-full w-full"
          style={{
            borderRadius: `${corkH * 0.5}px ${corkH * 0.5}px ${corkH * 0.35}px ${corkH * 0.35}px`,
            background: 'linear-gradient(180deg, #D9B892 0%, #C19A6B 55%, #A87F52 100%)',
            boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.4), inset 0 -3px 6px rgba(0,0,0,0.25)',
          }}
        />
      </motion.div>

      {/* Neck */}
      <div
        aria-hidden
        className="relative z-10 -mt-px border border-white/15 bg-white/[0.06] backdrop-blur-sm"
        style={{
          width: neckW,
          height: neckH,
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          boxShadow: 'inset 2px 0 4px rgba(255,255,255,0.18)',
        }}
      />

      {/* Body (glass) */}
      <div
        className="relative overflow-hidden border border-white/15"
        style={{
          width: bodyW,
          height: bodyH,
          borderRadius: `${width * 0.12}px ${width * 0.12}px ${width * 0.28}px ${width * 0.28}px`,
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(6px)',
          boxShadow:
            'inset 0 2px 10px rgba(255,255,255,0.15), inset 0 -20px 40px rgba(0,0,0,0.25), 0 30px 50px -20px rgba(0,0,0,0.6)',
        }}
      >
        {/* Inner warm light that swells when opening */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{
            height: '60%',
            background: 'radial-gradient(120% 90% at 50% 100%, rgba(251,207,232,0.35), transparent 70%)',
          }}
          animate={reduce ? undefined : { opacity: glow ? 0.9 : 0.4 }}
          transition={{ duration: 0.6 }}
        />

        {/* The pile of papers */}
        {pile.map((slot) => {
          const c = paperColorStyle(slot.color);
          const left = pad + slot.x * usableW;
          const bottom = pad + slot.y * usableH;
          return (
            <div
              key={slot.id}
              className="absolute"
              style={{
                left,
                bottom,
                width: paperW,
                height: paperH,
                zIndex: slot.z,
                transform: `rotate(${slot.rot}deg)`,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${c.paper} 0%, ${c.shade} 100%)`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
              }}
            >
              {/* fold line */}
              <span
                className="absolute inset-y-1 left-1/2 w-px -translate-x-1/2"
                style={{ background: 'rgba(0,0,0,0.08)' }}
              />
            </div>
          );
        })}

        {/* Vertical glass reflection */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-[6%] h-[80%]"
          style={{
            left: '16%',
            width: Math.max(6, width * 0.05),
            borderRadius: 999,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.05))',
            filter: 'blur(1px)',
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-[10%] h-[64%]"
          style={{
            right: '14%',
            width: Math.max(3, width * 0.02),
            borderRadius: 999,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0.03))',
          }}
        />
      </div>

      {/* Projected shadow */}
      <div
        aria-hidden
        className="mt-3"
        style={{
          width: bodyW * 0.8,
          height: 16,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.5), transparent 70%)',
          filter: 'blur(4px)',
        }}
      />
    </div>
  );
}
