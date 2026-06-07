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
