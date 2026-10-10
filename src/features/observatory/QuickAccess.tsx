import { useNavigate } from 'react-router-dom';
import { Mail, Sparkles, Heart } from 'lucide-react';
import { cn } from '@/utils/cn';

interface QuickAccessProps {
  /** When provided, the "Pensando en ti" tile is live and taps send a pulse. */
  onThink?: () => void;
  thinking?: boolean;
  /** Consecutive-day sincronía streak, shown as a small badge when > 0. */
  streak?: number;
}

/**
 * Quick access under "Esta semana" (§11, Hito 8).
 * Notas (Sprint A) · Pensando en ti (Sprint B) · Cometas (Sprint C, "Pronto").
 */
export function QuickAccess({ onThink, thinking = false, streak = 0 }: QuickAccessProps) {
  const navigate = useNavigate();
  const thinkingLive = typeof onThink === 'function';

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Notas */}
      <Tile
        label="Notas"
        icon={Mail}
        tint="text-blossom"
        onClick={() => navigate('/notes')}
      />

      {/* Pensando en ti */}
      <Tile
        label="Pensando en ti"
        icon={Heart}
        tint="text-blossom-soft"
        soon={!thinkingLive}
        disabled={thinking}
        badge={streak > 0 ? streak : undefined}
        onClick={onThink}
      />

      {/* Cometas — Sprint C */}
      <Tile label="Cometas" icon={Sparkles} tint="text-noir-soft" onClick={() => navigate('/comets')} />
    </div>
  );
}

interface TileProps {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  tint: string;
  onClick?: () => void;
  soon?: boolean;
  disabled?: boolean;
  badge?: number;
}

function Tile({ label, icon: Icon, tint, onClick, soon, disabled, badge }: TileProps) {
  const inactive = soon || disabled;
  return (
    <button
      type="button"
      disabled={inactive}
      onClick={onClick}
      aria-label={soon ? `${label} — pronto` : label}
      className={cn(
        'relative flex flex-col items-center gap-2 rounded-2xl border px-2 py-4 transition-all',
        soon
          ? 'cursor-default border-white/5 bg-white/[0.02]'
          : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.97] disabled:opacity-60',
      )}
    >
      <span
        className={cn(
          'grid h-11 w-11 place-items-center rounded-full bg-white/5',
          soon ? 'text-ink-faint' : tint,
        )}
      >
        <Icon className={cn('h-5 w-5', disabled && !soon && 'animate-pulse')} strokeWidth={1.8} />
      </span>
      <span className={cn('text-center text-xs leading-tight', soon ? 'text-ink-faint' : 'text-ink-soft')}>
        {label}
      </span>

      {soon && (
        <span className="absolute right-1.5 top-1.5 rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-ink-faint">
          Pronto
        </span>
      )}
      {badge !== undefined && (
        <span className="absolute right-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blossom px-1 text-[10px] font-medium text-void shadow-blossom">
          {badge}
        </span>
      )}
    </button>
  );
}
