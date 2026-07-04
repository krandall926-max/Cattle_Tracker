import type { AnimalType, Breed, Sex, AnimalStatus, TaskCategory } from './types'

// Average gestation for beef cattle. Used to project expected calving dates.
// Stored as a setting so it can be tuned later without a code change.
export const DEFAULT_GESTATION_DAYS = 283

export const BREED_LABELS: Record<Breed, string> = {
  black_angus: 'Black Angus',
  red_angus: 'Red Angus',
  milk_cow: 'Milk Cow',
}

export const TYPE_LABELS: Record<AnimalType, string> = {
  cow: 'Cow',
  bull: 'Bull',
  calf: 'Calf',
  heifer: 'Heifer',
  steer: 'Steer',
}

export const STATUS_LABELS: Record<AnimalStatus, string> = {
  active: 'Active',
  sold: 'Sold',
  deceased: 'Deceased',
  cull: 'Cull',
}

export const SEX_LABELS: Record<Sex, string> = { F: 'Female', M: 'Male' }

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  preg_check: 'Pregnancy check',
  vaccination: 'Vaccination',
  weaning: 'Weaning',
  calving: 'Calving',
  move: 'Move / Sort',
  other: 'Other',
}

// Pasture names transcribed from the ranch map. Wells and gates get layered on
// later once the owner walks through them.
export const SEED_PASTURES = [
  'Home',
  'Calving Lot',
  'School Section',
  'Sand Cherry',
  'Hinns',
  'Deying',
  'Terry',
  'Little Spring',
  'Big Spring',
  'AJ Flat',
  'Dakem',
  'Kella',
  'Kearns',
  'Deklin',
  'Wooden Tank',
]
