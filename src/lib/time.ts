/**
 * Time helpers anchored to ICT (UTC+7).
 *
 * The backend stores and computes dates in ICT (handover §6.6). "Today" and
 * streak boundaries must be evaluated in ICT regardless of the device timezone,
 * otherwise a user in another zone sees the wrong day.
 */
import { APP_UTC_OFFSET_MINUTES } from '../config';

const MS_PER_MINUTE = 60_000;

/** A Date shifted so that its UTC fields read as ICT wall-clock time. */
function toIct(date: Date): Date {
  return new Date(date.getTime() + APP_UTC_OFFSET_MINUTES * MS_PER_MINUTE);
}

/** ISO date key (YYYY-MM-DD) for the given instant, in ICT. */
export function ictDateKey(date: Date = new Date()): string {
  return toIct(date).toISOString().slice(0, 10);
}

/** True when two instants fall on the same ICT calendar day. */
export function isSameIctDay(a: Date, b: Date): boolean {
  return ictDateKey(a) === ictDateKey(b);
}

/** Today's ICT date key. */
export function todayKey(): string {
  return ictDateKey();
}

/** ICT hour (0–23) for an instant. */
export function ictHour(date: Date): number {
  return toIct(date).getUTCHours();
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

/** Bucket an instant into morning (<12) / afternoon (12–16) / evening (≥17), ICT. */
export function timeOfDay(iso: string): TimeOfDay {
  const h = ictHour(new Date(iso));
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

/** HH:mm in ICT. */
export function ictClock(iso: string): string {
  return toIct(new Date(iso)).toISOString().slice(11, 16);
}

/** Format a YYYY-MM-DD key as a readable date in the given locale. */
export function formatDateKey(
  dateKey: string,
  locale: string,
  opts?: Intl.DateTimeFormatOptions,
): string {
  try {
    return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
      ...opts,
    }).format(new Date(`${dateKey}T00:00:00Z`));
  } catch {
    return dateKey;
  }
}

/** True if a date key is after today (ICT). */
export function isFutureKey(dateKey: string): boolean {
  return dateKey > todayKey();
}

/** i18n key for the time-of-day greeting (ICT). */
export function greetingKey(): 'goodMorning' | 'goodAfternoon' | 'goodEvening' {
  const h = ictHour(new Date());
  if (h < 12) return 'goodMorning';
  if (h < 17) return 'goodAfternoon';
  return 'goodEvening';
}
