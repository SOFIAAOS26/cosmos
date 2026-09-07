import { Clock, MapPin } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui';
import { EVENT_META, osmEmbedUrl, eventInstantIso } from './eventMeta';
import { useCountdown } from '@/hooks/useCountdown';
import { formatKey } from '@/utils/date';
import type { CosmosEvent } from '@/types/database';

/**
 * The event as a physical, elegant ticket (§22): title, date, time, location,
 * map, countdown, notes — with a perforated stub.
 */
export function EventTicket({ event, className }: { event: CosmosEvent; className?: string }) {
  const meta = EVENT_META[event.type];
  const Icon = meta.icon;
  const parts = useCountdown(eventInstantIso(event.date, event.time), 'minute');
  const hasMap = event.latitude != null && event.longitude != null;

  return (
    <div className={cn('overflow-hidden rounded-2xl bg-surface-elevated shadow-lift', className)}>
      {/* Top — the ticket face */}
      <div className="relative bg-gradient-to-br from-surface-elevated to-surface p-5">
        <div className="flex items-center gap-2">
          <Badge tone="aura">
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
          </Badge>
          <span className="text-xs uppercase tracking-widest text-ink-faint">Admite dos</span>
        </div>
        <h3 className="mt-3 font-display text-2xl leading-tight text-ink">{event.title}</h3>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
          <span className="capitalize">{formatKey(event.date, "EEEE d 'de' MMMM")}</span>
          {event.time && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {event.time}
            </span>
          )}
        </div>
        {event.location && (
          <p className="mt-1 inline-flex items-center gap-1 text-sm text-ink-soft">
            <MapPin className="h-3.5 w-3.5" /> {event.location}
          </p>
        )}
      </div>

      {/* Perforation */}
      <div className="relative h-0">
        <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-void" />
        <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-void" />
        <div className="mx-4 border-t border-dashed border-white/15" />
      </div>

      {/* Stub — countdown + map */}
      <div className="space-y-4 p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-faint">Cuenta regresiva</p>
            {parts?.isPast ? (
              <p className="mt-1 font-display text-2xl text-blossom">¡Es hoy!</p>
            ) : (
              <p className="mt-1 font-display text-3xl text-ink">
                {parts?.days ?? '—'}
                <span className="ml-1 text-base text-ink-faint">
                  {parts?.days === 1 ? 'día' : 'días'}
                </span>
              </p>
            )}
          </div>
          {!parts?.isPast && parts && (
            <p className="text-sm text-ink-faint">
              {parts.hours}h {parts.minutes}m
            </p>
          )}
        </div>

        {hasMap && (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <iframe
              title="Mapa"
              src={osmEmbedUrl(event.latitude as number, event.longitude as number)}
              className="h-40 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}

        {event.description && (
          <p className="text-sm leading-relaxed text-ink-soft">{event.description}</p>
        )}
      </div>
    </div>
  );
}
