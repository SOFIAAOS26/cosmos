import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';

/**
 * Timezone discipline (§55).
 * - The database stores timestamptz in UTC and calendar `date` as plain dates.
 * - A COSMOS has ONE timezone; day boundaries are computed in that timezone so
 *   an event never accidentally jumps a day due to a device conversion.
 * - `DateKey` is always 'YYYY-MM-DD' interpreted in the cosmos timezone.
 */
export type DateKey = string; // 'YYYY-MM-DD'

const KEY_FMT = 'yyyy-MM-dd';

/** Today's date-key in the given timezone. */
export function todayKey(timezone: string): DateKey {
  return formatInTimeZone(new Date(), timezone, KEY_FMT);
}

/** Convert an instant to the cosmos-local date-key. */
export function instantToKey(instant: Date | string, timezone: string): DateKey {
  const d = typeof instant === 'string' ? parseISO(instant) : instant;
  return formatInTimeZone(d, timezone, KEY_FMT);
}

/** A date-key -> a Date anchored at local noon (safe for month math / display). */
export function keyToDate(key: DateKey): Date {
  // Noon avoids DST edge issues when only the calendar day matters.
  return parseISO(`${key}T12:00:00`);
}

export function formatKey(key: DateKey, pattern = "d 'de' MMMM"): string {
  return format(keyToDate(key), pattern, { locale: es });
}

/** "SEPTIEMBRE 2026" style month label (upper-cased by caller if desired). */
export function monthLabel(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: es });
}

export const WEEKDAYS_ES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export interface CalendarCell {
  key: DateKey;
  date: Date;
  inMonth: boolean;
  isToday: boolean;
}

/**
 * Build a Monday-first month matrix (6 weeks) for a given month.
 * `now` supplies "today" already resolved to the cosmos timezone.
 */
export function buildMonthMatrix(monthDate: Date, todayKeyStr: DateKey): CalendarCell[] {
  const first = startOfMonth(monthDate);
  const gridStart = startOfWeek(first, { weekStartsOn: 1 });
  // Always render 6 weeks (42 cells) for a stable calendar height across months.
  const gridEnd = addDays(gridStart, 41);
  return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => {
    const key = format(date, KEY_FMT);
    return {
      key,
      date,
      inMonth: isSameMonth(date, monthDate),
      isToday: key === todayKeyStr,
    };
  });
}

export { addMonths, subMonths, isSameDay, differenceInCalendarDays, format };
