import type { AnimalType, Sex, AnimalStatus, TaskCategory } from './types'

// Average gestation for beef cattle. Used to project expected calving dates.
// Stored as a setting so it can be tuned later without a code change.
export const DEFAULT_GESTATION_DAYS = 283

// Breed is free text now (covers Angus, Milk Cow, horses, pigs…). These power
// the type-ahead suggestions in the form.
export const BREED_SUGGESTIONS = [
  'Angus',
  'Milk Cow',
  'Quarter Horse',
  'Paint',
  'Donkey',
  'Hampshire',
  'Duroc',
]

// Coat color suggestions (also free text).
export const COLOR_SUGGESTIONS = [
  'Black',
  'Red',
  'Red/White',
  'Black/White',
  'Roan',
  'Bay',
  'Sorrel',
  'Buckskin',
  'Grey',
  'White',
  'Spotted',
]

export const TYPE_LABELS: Record<AnimalType, string> = {
  cow: 'Cow',
  bull: 'Bull',
  calf: 'Calf',
  heifer: 'Heifer',
  steer: 'Steer',
  show: 'Show Steer/Heifer',
  horse: 'Horse',
  pig: 'Pig',
  donkey: 'Donkey',
}

export const STATUS_LABELS: Record<AnimalStatus, string> = {
  active: 'Active',
  sold: 'Sold',
  deceased: 'Deceased',
  cull: 'Cull',
}

export const SEX_LABELS: Record<Sex, string> = { F: 'Female', M: 'Male' }

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  ai: 'AI / Breeding',
  preg_check: 'Pregnancy check',
  vaccination: 'Vaccination',
  medicine: 'Medicine',
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
