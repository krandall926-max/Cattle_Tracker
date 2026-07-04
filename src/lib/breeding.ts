import type { BreedingRecord } from '../types'
import { DEFAULT_GESTATION_DAYS } from '../constants'
import { addDays, daysUntil } from './dates'

// Breeding math lives here so the dashboard and the breeding screen agree.

/** The date a cow was bred: AI date if AI, else bull turnout date. */
export function breedingDate(rec: BreedingRecord): string | undefined {
  return rec.method === 'AI' ? rec.aiDate : rec.bullTurnoutDate
}

/** Projected calving date = breeding date + gestation. */
export function projectedCalving(
  rec: BreedingRecord,
  gestation = DEFAULT_GESTATION_DAYS,
): string | undefined {
  const bred = breedingDate(rec)
  return bred ? addDays(bred, gestation) : undefined
}

export type CalvingWindow = 'due_now' | 'due_soon' | 'due_later' | 'overdue' | 'none'

/**
 * Bucket a breeding by how close calving is, for the "Cows ready for calving"
 * dashboard cards. Only records that are bred and not yet calved count.
 */
export function calvingWindow(rec: BreedingRecord): CalvingWindow {
  if (rec.actualCalvingDate) return 'none'
  if (rec.pregCheckResult === 'open') return 'none'
  const due = rec.expectedCalvingDate ?? projectedCalving(rec)
  if (!due) return 'none'
  const n = daysUntil(due)
  if (n < 0) return 'overdue'
  if (n <= 14) return 'due_now'
  if (n <= 45) return 'due_soon'
  return 'due_later'
}

export const CALVING_WINDOW_LABELS: Record<CalvingWindow, string> = {
  overdue: 'Overdue',
  due_now: 'Due now',
  due_soon: 'Due soon',
  due_later: 'Due later',
  none: '',
}
