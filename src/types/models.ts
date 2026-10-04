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

/* ----------------------- El Frasco de Nosotros (§11, §16) ----------------------- */

export type PaperColor = 'rose' | 'lavender' | 'butter' | 'mint' | 'sky' | 'peach' | 'cream';

export interface PaperColorStyle {
  key: PaperColor;
  label: string;
  /** Paper surface (soft pastel, never oversaturated). */
  paper: string;
  /** Warm shadow for depth. */
  shade: string;
}

export const PAPER_COLORS: PaperColorStyle[] = [
  { key: 'rose', label: 'Rosa palo', paper: '#F7D5DC', shade: '#E7B4BE' },
  { key: 'lavender', label: 'Lavanda', paper: '#E2DAF4', shade: '#C7BBE6' },
  { key: 'butter', label: 'Mantequilla', paper: '#FBF0C2', shade: '#EcdF9b' },
  { key: 'mint', label: 'Menta', paper: '#D4EFE0', shade: '#B4DCC8' },
  { key: 'sky', label: 'Cielo', paper: '#D6E6F6', shade: '#B6CFEC' },
  { key: 'peach', label: 'Durazno', paper: '#FBE0CD', shade: '#F0C3A6' },
  { key: 'cream', label: 'Crema', paper: '#F5EDE1', shade: '#E2D5C2' },
];

/** The warm ink used on every paper — legible on all pastels. */
export const PAPER_INK = '#2E2A24';

export function paperColorStyle(key: PaperColor): PaperColorStyle {
  return PAPER_COLORS.find((c) => c.key === key) ?? PAPER_COLORS[PAPER_COLORS.length - 1]!;
}

export type PaperIntention =
  | 'anytime'
  | 'miss-you'
  | 'sad'
  | 'angry'
  | 'remember'
  | 'laugh'
  | 'us'
  | 'secret';

export interface PaperIntentionStyle {
  key: PaperIntention;
  emoji: string;
  label: string;
  /** Shown gently when opening this intention (optional). */
  prompt?: string;
}

export const PAPER_INTENTIONS: PaperIntentionStyle[] = [
  { key: 'anytime', emoji: '💗', label: 'Cualquier momento' },
  { key: 'miss-you', emoji: '🌙', label: 'Cuando me extrañes' },
  { key: 'sad', emoji: '🫂', label: 'Cuando tengas un día difícil' },
  {
    key: 'angry',
    emoji: '❤️',
    label: 'Cuando estemos enojados',
    prompt: 'Antes de responder, recuerda por qué guardaste esto.',
  },
  { key: 'remember', emoji: '✨', label: 'Cuando necesites recordar' },
  { key: 'laugh', emoji: '😂', label: 'Cuando necesites reír' },
  { key: 'us', emoji: '♾️', label: 'Nosotros' },
  { key: 'secret', emoji: '🔐', label: 'Secreto' },
];

export function paperIntentionStyle(key: PaperIntention): PaperIntentionStyle {
  return PAPER_INTENTIONS.find((i) => i.key === key) ?? PAPER_INTENTIONS[0]!;
}
