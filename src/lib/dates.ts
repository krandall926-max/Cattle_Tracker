// Date helpers. We store dates as plain `yyyy-mm-dd` strings (no timezone
// surprises) and only convert to Date objects for math and display.

/** Today as yyyy-mm-dd in the device's local time. */
export function todayISO(): string {
  const d = new Date()
  return toISODate(d)
}

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Parse a yyyy-mm-dd string to a local Date at midnight. */
export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function addDays(iso: string, days: number): string {
  const d = fromISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

/** Whole days from today until `iso` (negative = in the past). */
export function daysUntil(iso: string): number {
  const now = fromISODate(todayISO()).getTime()
  const then = fromISODate(iso).getTime()
  return Math.round((then - now) / 86400000)
}

export function daysBetween(a: string, b: string): number {
  return Math.round((fromISODate(b).getTime() - fromISODate(a).getTime()) / 86400000)
}

/** Human-friendly date, e.g. "Mar 27, 2025". Empty string for missing dates. */
export function formatDate(iso?: string): string {
  if (!iso) return ''
  return fromISODate(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** "in 12 days" / "today" / "9 days ago" for dashboards. */
export function relativeDays(iso?: string): string {
  if (!iso) return ''
  const n = daysUntil(iso)
  if (n === 0) return 'today'
  if (n === 1) return 'tomorrow'
  if (n === -1) return 'yesterday'
  if (n > 0) return `in ${n} days`
  return `${Math.abs(n)} days ago`
}

/** Age in years/months from a birth date, for herd lists. */
export function ageFrom(iso?: string): string {
  if (!iso) return ''
  const days = -daysUntil(iso)
  if (days < 0) return ''
  if (days < 60) return `${days} d`
  const months = Math.floor(days / 30.44)
  if (months < 24) return `${months} mo`
  return `${Math.floor(days / 365.25)} yr`
}
