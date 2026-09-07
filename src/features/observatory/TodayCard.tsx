import { useMemo } from 'react';
import { GlassCard, Avatar } from '@/components/ui';
import { NediScene } from '@/components/nedi';
import { useDay } from '@/features/day/useDay';
import { useCosmos } from '@/providers/CosmosProvider';
import { todayKey } from '@/utils/date';
import { identityOf } from '@/theme/identity';

/**
 * "¿En qué anda hoy?" (§11, §13).
 * A quiet summary of the other person's day — so you know how they are without
 * having to ask.
 */
export function TodayCard() {
  const { cosmos, partner } = useCosmos();
  const today = todayKey(cosmos?.timezone ?? 'UTC');
  const { tasks, events, loading } = useDay(today);

  const partnerAgenda = useMemo(() => {
    if (!partner) return [];
    const evs = events
      .filter(() => true)
      .map((e) => ({ time: e.time ?? '', title: e.title, kind: 'event' as const }));
    const tks = tasks
      .filter((t) => t.author_id === partner.user_id)
      .map((t) => ({ time: '', title: t.title, done: t.completed, kind: 'task' as const }));
    return [...evs, ...tks].sort((a, b) => (a.time || '99').localeCompare(b.time || '99')).slice(0, 5);
  }, [events, tasks, partner]);

  if (!partner) return null;
  const id = identityOf(partner.identity);

  return (
    <GlassCard>
      <div className="mb-3 flex items-center gap-3">
        <Avatar name={partner.profile.display_name} identity={partner.identity} src={partner.profile.avatar_url} />
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-faint">¿En qué anda hoy?</p>
          <p className={`font-display text-lg ${id.text}`}>{partner.profile.display_name}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
        </div>
      ) : partnerAgenda.length === 0 ? (
        <NediScene state="idle" size={80} align="start" caption="Un día tranquilo, por ahora." />
      ) : (
        <ul className="space-y-1.5">
          {partnerAgenda.map((item, i) => (
            <li key={i} className="flex items-baseline gap-3 text-sm">
              <span className="w-12 shrink-0 tabular-nums text-ink-faint">{item.time || '·'}</span>
              <span className={item.kind === 'task' && item.done ? 'text-ink-faint line-through' : 'text-ink'}>
                {item.title}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-sm italic text-blossom">Mucho éxito hoy ♡</p>
    </GlassCard>
  );
}
