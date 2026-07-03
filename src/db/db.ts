import Dexie, { type Table } from 'dexie'
import type {
  Animal,
  BreedingRecord,
  Pasture,
  Task,
  Setting,
} from '../types'

// The local database. Everything the app shows comes from here, so the whole
// app works with no internet. A cloud-sync layer can later read `updatedAt` /
// `deleted` on each table to push and pull changes.
export class SandCreekDB extends Dexie {
  animals!: Table<Animal, string>
  breedings!: Table<BreedingRecord, string>
  pastures!: Table<Pasture, string>
  tasks!: Table<Task, string>
  settings!: Table<Setting, string>

  constructor() {
    super('sand-creek-cattle')
    this.version(1).stores({
      // Indexes chosen for the screens we actually query: herd search by tag,
      // cow-calf lookups by dam, breeding by cow, tasks by due date.
      animals: 'id, tag, type, breed, status, damId, pastureId, updatedAt',
      breedings: 'id, cowId, method, expectedCalvingDate, pregCheckResult, updatedAt',
      pastures: 'id, name, updatedAt',
      tasks: 'id, dueDate, category, done, animalId, updatedAt',
      settings: 'key',
    })
  }
}

export const db = new SandCreekDB()

/** Stamp write-time fields on a record before saving. */
export function touch<T extends { createdAt?: number; updatedAt: number }>(
  record: T,
): T {
  const now = Date.now()
  if (!record.createdAt) record.createdAt = now
  record.updatedAt = now
  return record
}
