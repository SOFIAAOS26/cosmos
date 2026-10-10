import { useNavigate } from 'react-router-dom';
import { Mail, Sparkles, Heart } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ComponentType } from 'react';

interface Tile {
  key: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: ComponentType<any>;
  to?: string;
  soon?: boolean;
  tint: string; // icon color class
}

/**
 * Quick access under "Esta semana" (§11, Hito 8 · Sprint A).
 * Notas is pulled up from "Más" so it's one tap from home. Cometas and
 * "Pensando en ti" hold their place here and light up in Sprints B & C.
 */
const TILES: Tile[] = [
  { key: 'notes', label: 'Notas', icon: Mail, to: '/notes', tint: 'text-blossom' },
  { key: 'comets', label: 'Cometas', icon: Sparkles, soon: true, tint: 'text-noir-soft' },
  { key: 'thinking', label: 'Pensando en ti', icon: Heart, soon: true, tint: 'text-blossom-soft' },
];

export function QuickAccess() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 gap-3">
      {TILES.map(({ key, label, icon: Icon, to, soon, tint }) => (
        <button
          key={key}
          type="button"
          disabled={soon}
          onClick={() => to && navigate(to)}
          aria-label={soon ? `${label} — pronto` : label}
          className={cn(
            'relative flex flex-col items-center gap-2 rounded-2xl border px-2 py-4 transition-all',
            soon
              ? 'cursor-default border-white/5 bg-white/[0.02]'
              : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.97]',
          )}
        >
          <span
            className={cn(
              'grid h-11 w-11 place-items-center rounded-full bg-white/5',
              soon ? 'text-ink-faint' : tint,
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <span className={cn('text-center text-xs leading-tight', soon ? 'text-ink-faint' : 'text-ink-soft')}>
            {label}
          </span>
          {soon && (
            <span className="absolute right-1.5 top-1.5 rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-ink-faint">
              Pronto
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
