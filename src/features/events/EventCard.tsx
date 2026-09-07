import { Clock, MapPin } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { EVENT_META, eventInstantIso } from './eventMeta';
import { useCountdown } from '@/hooks/useCountdown';
import { formatKey } from '@/utils/date';
import type { CosmosEvent } from '@/types/database';

export function EventCard({ event, onClick }: { event: CosmosEvent; onClick?: () => void }) {
  const meta = EVENT_META[event.type];
  const Icon = meta.icon;
  const parts = useCountdown(eventInstantIso(event.date, event.time), 'minute');

  return (
    <Card as="article" className="cursor-pointer transition-colors hover:bg-surface-elevated" onClick={onClick}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-aura/10 text-aura">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-ink">{event.title}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-ink-faint">
            <span>{formatKey(event.date)}</span>
            {event.time && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {event.time}
              </span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3" /> {event.location}
              </span>
            )}
          </div>
        </div>
        {parts && (
          <Badge tone={parts.isPast ? 'blossom' : 'neutral'}>
            {parts.isPast ? 'Hoy' : `${parts.days}d`}
          </Badge>
        )}
      </div>
    </Card>
  );
}
