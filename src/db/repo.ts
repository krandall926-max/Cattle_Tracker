import { db, touch } from './db'
import { newId } from '../lib/id'
import type {
  Animal,
  BreedingRecord,
  Pasture,
  Task,
} from '../types'

// Thin data-access helpers. Components call these instead of touching Dexie
// directly, so write-stamping and soft-deletes stay consistent everywhere.

// ---- Animals ----------------------------------------------------------------

export async function saveAnimal(
  input: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<Animal, 'id'>>,
): Promise<string> {
  const id = input.id ?? newId()
  const existing = input.id ? await db.animals.get(input.id) : undefined
  const record: Animal = touch({
    createdAt: existing?.createdAt ?? 0,
    ...existing,
    ...input,
    id,
  } as Animal)
  await db.animals.put(record)
  return id
}

export async function softDeleteAnimal(id: string): Promise<void> {
  const a = await db.animals.get(id)
  if (a) await db.animals.put(touch({ ...a, deleted: true }))
}

/** Calves whose dam is this cow (cow-calf pairing). */
export async function calvesOf(damId: string): Promise<Animal[]> {
  const list = await db.animals.where('damId').equals(damId).toArray()
  return list.filter((a) => !a.deleted)
}

// ---- Breeding ---------------------------------------------------------------

export async function saveBreeding(
  input: Omit<BreedingRecord, 'id' | 'createdAt' | 'updatedAt'> &
    Partial<Pick<BreedingRecord, 'id'>>,
): Promise<string> {
  const id = input.id ?? newId()
  const existing = input.id ? await db.breedings.get(input.id) : undefined
  const record: BreedingRecord = touch({
    createdAt: existing?.createdAt ?? 0,
    ...existing,
    ...input,
    id,
  } as BreedingRecord)
  await db.breedings.put(record)
  return id
}

export async function softDeleteBreeding(id: string): Promise<void> {
  const b = await db.breedings.get(id)
  if (b) await db.breedings.put(touch({ ...b, deleted: true }))
}

export async function breedingsOf(cowId: string): Promise<BreedingRecord[]> {
  const list = await db.breedings.where('cowId').equals(cowId).toArray()
  return list
    .filter((b) => !b.deleted)
    .sort((a, b) => (b.aiDate ?? b.bullTurnoutDate ?? '').localeCompare(a.aiDate ?? a.bullTurnoutDate ?? ''))
}

// ---- Pastures ---------------------------------------------------------------

export async function savePasture(
  input: Omit<Pasture, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<Pasture, 'id'>>,
): Promise<string> {
  const id = input.id ?? newId()
  const existing = input.id ? await db.pastures.get(input.id) : undefined
  const record: Pasture = touch({
    createdAt: existing?.createdAt ?? 0,
    ...existing,
    ...input,
    id,
  } as Pasture)
  await db.pastures.put(record)
  return id
}

export async function softDeletePasture(id: string): Promise<void> {
  const p = await db.pastures.get(id)
  if (p) await db.pastures.put(touch({ ...p, deleted: true }))
}

// ---- Tasks ------------------------------------------------------------------

export async function saveTask(
  input: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<Task, 'id'>>,
): Promise<string> {
  const id = input.id ?? newId()
  const existing = input.id ? await db.tasks.get(input.id) : undefined
  const record: Task = touch({
    createdAt: existing?.createdAt ?? 0,
    ...existing,
    ...input,
    id,
  } as Task)
  await db.tasks.put(record)
  return id
}

export async function softDeleteTask(id: string): Promise<void> {
  const t = await db.tasks.get(id)
  if (t) await db.tasks.put(touch({ ...t, deleted: true }))
}
