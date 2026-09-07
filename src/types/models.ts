/**
 * App-facing domain enums & constants.
 * These mirror the Postgres enums/checks defined in supabase/migrations.
 */
import type { Identity } from '@/theme/identity';

export type { Identity };

export type MemberRole = 'owner' | 'member';

export type TaskPriority = 'normal' | 'important' | 'high';
export const TASK_PRIORITIES: TaskPriority[] = ['normal', 'important', 'high'];

/** Initial categories (§18). Stored as free text to allow future additions. */
export const TASK_CATEGORIES = [
  'Trabajo',
  'Examen',
  'Salud',
  'Personal',
  'Familia',
  'Prioridad',
  'Importante',
] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number] | (string & {});

export type EventType = 'date' | 'trip' | 'concert' | 'dinner' | 'experience' | 'other';
export const EVENT_TYPES: EventType[] = [
  'date',
  'trip',
  'concert',
  'dinner',
  'experience',
  'other',
];

export type NoteKind = 'immediate' | 'scheduled' | 'sealed';

export type CheckinMood = 'relief' | 'good' | 'survived' | 'win' | 'rough';
export const CHECKIN_MOODS: { key: CheckinMood; emoji: string; label: string }[] = [
  { key: 'relief', emoji: '😮‍💨', label: 'Por fin' },
  { key: 'good', emoji: '😎', label: 'Salió bien' },
  { key: 'survived', emoji: '🥹', label: 'Sobreviví' },
  { key: 'win', emoji: '✨', label: '¡Lo logré!' },
  { key: 'rough', emoji: '😩', label: 'Fue horrible' },
];

/** Gentle, pre-written support messages (§19). */
export const SUPPORT_MESSAGES = [
  'Mucho éxito hoy ♡',
  'Ya casi sales de eso',
  'Orgulloso de ti',
  'Aquí estoy contigo',
  'Tú puedes con esto',
] as const;

export type SongPlatform = 'spotify' | 'youtube';

export type NotificationType =
  | 'support_received'
  | 'task_completed'
  | 'checkin_received'
  | 'note_unlocked'
  | 'event_upcoming';
