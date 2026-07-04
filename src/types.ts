// Core data model for Sand Creek Cattle.
//
// Every record carries `updatedAt` and a soft-delete `deleted` flag. Nothing is
// ever hard-deleted locally so that a future cloud-sync layer can merge edits
// from multiple devices (last-write-wins per record) without losing history.

export type AnimalType =
  | 'cow'
  | 'bull'
  | 'calf'
  | 'heifer'
  | 'steer'
  | 'show' // Show Steer/Heifer
  | 'horse'
  | 'pig'
  | 'donkey'

export type Sex = 'F' | 'M'

export type AnimalStatus = 'active' | 'sold' | 'deceased' | 'cull'

/**
 * The "Gen" / "Val" marker written next to some tags. Per the owner it tracks
 * coat pattern — Val = baldy (white-faced), Gen = solid color — though the exact
 * meaning of the abbreviations is still being confirmed.
 */
export type RegistryCode = '' | 'Gen' | 'Val'

export interface Animal {
  id: string
  tag: string
  name?: string
  type: AnimalType
  /** Free-text breed (e.g. "Angus", "Milk Cow", "Quarter Horse"). */
  breed: string
  /** Coat color (e.g. "Black", "Red"). */
  color?: string
  sex: Sex
  status: AnimalStatus
  /** ISO date (yyyy-mm-dd). */
  birthDate?: string
  purchaseDate?: string
  /** Dam (mother) animal id — the heart of cow-calf linking. */
  damId?: string
  /** Sire animal id, when the father is one of our own bulls. */
  sireId?: string
  /** Free-text sire/semen name for AI breedings not tied to an on-farm bull. */
  sireTag?: string
  pastureId?: string
  /** Hidden marker stripped from the handwritten tag list ("Gen"/"Val"). */
  registryCode?: RegistryCode
  notes?: string
  /** Data-URL photo (optional, kept small). */
  photo?: string
  createdAt: number
  updatedAt: number
  deleted?: boolean
}

export type BreedingMethod = 'AI' | 'bull'
export type PregCheckResult = 'open' | 'bred' | 'recheck' | 'unknown'

export interface BreedingRecord {
  id: string
  cowId: string
  method: BreedingMethod
  /** AI service date. */
  aiDate?: string
  /** Semen / AI sire name or code. */
  aiSire?: string
  /** Which on-farm bull was turned out (animal id). */
  bullId?: string
  bullTurnoutDate?: string
  bullRemovalDate?: string
  /** Auto-calculated from the breeding date + gestation (see lib/breeding.ts). */
  expectedCalvingDate?: string
  pregCheckDate?: string
  pregCheckResult?: PregCheckResult
  actualCalvingDate?: string
  /** Calf produced by this breeding (animal id), once linked. */
  resultingCalfId?: string
  notes?: string
  createdAt: number
  updatedAt: number
  deleted?: boolean
}

export interface Pasture {
  id: string
  name: string
  acres?: number
  notes?: string
  createdAt: number
  updatedAt: number
  deleted?: boolean
}

export type TaskCategory =
  | 'ai'
  | 'preg_check'
  | 'vaccination'
  | 'medicine'
  | 'weaning'
  | 'calving'
  | 'move'
  | 'other'

/** A scheduled item / reminder: a subject + a date (AI scheduling, etc.). */
export interface Task {
  id: string
  title: string
  dueDate: string
  category: TaskCategory
  animalId?: string
  done: boolean
  notes?: string
  createdAt: number
  updatedAt: number
  deleted?: boolean
}

/** A medicine / treatment given to an animal (administration log). */
export interface Treatment {
  id: string
  animalId: string
  /** ISO date it was given. */
  date: string
  /** Product / medicine name. */
  product: string
  dose?: string
  /** Route (e.g. SubQ, IM, oral). */
  route?: string
  notes?: string
  createdAt: number
  updatedAt: number
  deleted?: boolean
}

/** Key/value app settings (farm name, gestation length, last backup, etc.). */
export interface Setting {
  key: string
  value: unknown
}
