import { Heart, Plane, Music2, UtensilsCrossed, Sparkles, CalendarDays, type LucideIcon } from 'lucide-react';
import type { EventType } from '@/types/models';

export const EVENT_META: Record<EventType, { label: string; icon: LucideIcon }> = {
  date: { label: 'Cita', icon: Heart },
  trip: { label: 'Viaje', icon: Plane },
  concert: { label: 'Concierto', icon: Music2 },
  dinner: { label: 'Cena', icon: UtensilsCrossed },
  experience: { label: 'Experiencia', icon: Sparkles },
  other: { label: 'Otro', icon: CalendarDays },
};

/** OpenStreetMap embed URL (no API key) centered on a small bbox with a marker. */
export function osmEmbedUrl(lat: number, lon: number, delta = 0.01): string {
  const left = (lon - delta).toFixed(5);
  const right = (lon + delta).toFixed(5);
  const top = (lat + delta).toFixed(5);
  const bottom = (lat - delta).toFixed(5);
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lon}`;
}

/** Combine an event's date + optional time into an ISO instant. */
export function eventInstantIso(date: string, time?: string | null): string {
  return new Date(`${date}T${time ?? '00:00'}:00`).toISOString();
}
