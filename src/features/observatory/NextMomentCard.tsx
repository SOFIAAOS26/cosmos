import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/ui';
import { usePrimaryCountdown } from '@/features/countdowns/usePrimaryCountdown';
import { useCountdown } from '@/hooks/useCountdown';

/** "NEXT ADVENTURE — 12 DAYS" (§11, §24). Calculated live from the target date. */
export function NextMomentCard() {
  const navigate = useNavigate();
  const { moment, loading } = usePrimaryCountdown();
  const parts = useCountdown(moment?.target ?? null, 'minute');

  if (loading) return <GlassCard className="h-28 animate-pulse" />;

  if (!moment || !parts) {
    return (
      <GlassCard
        role="button"
        tabIndex={0}
        onClick={() => navigate('/future')}
        className="cursor-pointer transition-colors hover:bg-surface/80"
      >
        <p className="text-xs uppercase tracking-widest text-ink-faint">Próxima aventura</p>
        <p className="mt-2 font-display text-lg text-ink">El futuro está esperando.</p>
        <p className="mt-1 text-sm text-blossom">Fija su próximo gran momento →</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard
      glow="blossom"
      role="button"
      tabIndex={0}
      onClick={() => navigate('/future')}
      className="cursor-pointer"
    >
      <p className="text-xs uppercase tracking-widest text-ink-faint">Próxima aventura</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-display text-xl text-ink">{moment.title}</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-display text-3xl leading-none text-blossom">
            {parts.isPast ? '¡Hoy!' : parts.days}
          </div>
          {!parts.isPast && (
            <div className="text-[11px] uppercase tracking-widest text-ink-faint">
              {parts.days === 1 ? 'día' : 'días'}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
