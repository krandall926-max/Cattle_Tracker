import { db } from '../db/db'
import { saveAnimal } from '../db/repo'
import { newId } from './id'
import { todayISO } from './dates'
import type { Animal, AnimalType, Breed, Sex } from '../types'
import { BREED_LABELS } from '../constants'

// Backup + import. Until cloud sync lands, this is how data leaves and returns
// to a device: a single JSON file the owner can save to their phone, email, or
// drop in a shared drive.

interface BackupFile {
  app: 'sand-creek-cattle'
  version: 1
  exportedAt: string
  animals: Animal[]
  breedings: unknown[]
  pastures: unknown[]
  tasks: unknown[]
  settings: unknown[]
}

export async function exportBackup(): Promise<BackupFile> {
  const [animals, breedings, pastures, tasks, settings] = await Promise.all([
    db.animals.toArray(),
    db.breedings.toArray(),
    db.pastures.toArray(),
    db.tasks.toArray(),
    db.settings.toArray(),
  ])
  return {
    app: 'sand-creek-cattle',
    version: 1,
    exportedAt: new Date().toISOString(),
    animals,
    breedings,
    pastures,
    tasks,
    settings,
  }
}

export function downloadBackup(data: BackupFile): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sand-creek-backup-${todayISO()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Merge a backup file in (last-write-wins by updatedAt). */
export async function importBackup(data: BackupFile): Promise<void> {
  if (data.app !== 'sand-creek-cattle') {
    throw new Error('That file is not a Sand Creek Cattle backup.')
  }
  await db.transaction(
    'rw',
    [db.animals, db.breedings, db.pastures, db.tasks, db.settings],
    async () => {
      await mergeTable(db.animals, data.animals as Animal[])
      await mergeTable(db.breedings, data.breedings as never[])
      await mergeTable(db.pastures, data.pastures as never[])
      await mergeTable(db.tasks, data.tasks as never[])
      for (const s of data.settings as { key: string; value: unknown }[]) {
        await db.settings.put(s)
      }
    },
  )
}

async function mergeTable<T extends { id: string; updatedAt: number }>(
  table: { get(id: string): Promise<T | undefined>; put(row: T): Promise<unknown> },
  rows: T[],
): Promise<void> {
  for (const row of rows) {
    const existing = await table.get(row.id)
    if (!existing || row.updatedAt >= existing.updatedAt) {
      await table.put(row)
    }
  }
}

// ---- Starter herd CSV import ------------------------------------------------
//
// The transcribed tag list ships in public/starter-herd.csv. Columns:
//   tag, breed, type, sex, registry, notes
// This importer is forgiving: unknown breeds fall back to Black Angus and are
// flagged in notes, so a typo never blocks the whole load.

const BREED_BY_LABEL: Record<string, Breed> = Object.fromEntries(
  Object.entries(BREED_LABELS).map(([k, v]) => [v.toLowerCase(), k as Breed]),
) as Record<string, Breed>

export interface CsvImportResult {
  added: number
  skipped: number
  total: number
}

export async function importStarterHerdCsv(text: string): Promise<CsvImportResult> {
  const rows = parseCsv(text)
  if (rows.length === 0) return { added: 0, skipped: 0, total: 0 }
  const header = rows[0].map((h) => h.trim().toLowerCase())
  const idx = (name: string) => header.indexOf(name)
  const iTag = idx('tag')
  const iBreed = idx('breed')
  const iType = idx('type')
  const iSex = idx('sex')
  const iReg = idx('registry')
  const iNotes = idx('notes')

  const existing = new Set(
    (await db.animals.toArray()).filter((a) => !a.deleted).map((a) => a.tag.toUpperCase()),
  )

  let added = 0
  let skipped = 0
  for (const row of rows.slice(1)) {
    const tag = (row[iTag] ?? '').trim()
    if (!tag) continue
    if (existing.has(tag.toUpperCase())) {
      skipped++
      continue
    }
    const breedLabel = (row[iBreed] ?? '').trim().toLowerCase()
    const breed = BREED_BY_LABEL[breedLabel] ?? 'black_angus'
    const type = (row[iType]?.trim().toLowerCase() as AnimalType) || 'cow'
    const sex = ((row[iSex] ?? '').trim().toUpperCase() as Sex) || 'F'
    const registry = (row[iReg] ?? '').trim()
    const csvNotes = (row[iNotes] ?? '').trim()
    const notes = [csvNotes, breedLabel && !BREED_BY_LABEL[breedLabel] ? `breed "${row[iBreed]}" not recognized — set to Black Angus` : '']
      .filter(Boolean)
      .join(' · ')

    await saveAnimal({
      id: newId(),
      tag,
      type: ['cow', 'bull', 'calf', 'heifer', 'steer'].includes(type) ? type : 'cow',
      breed,
      sex: sex === 'M' ? 'M' : 'F',
      status: 'active',
      registryCode: registry === 'Gen' || registry === 'Val' ? registry : '',
      notes: notes || undefined,
    })
    existing.add(tag.toUpperCase())
    added++
  }
  return { added, skipped, total: rows.length - 1 }
}

/** Minimal CSV parser that handles quoted fields and commas within quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.some((f) => f.trim() !== '')) rows.push(row)
      row = []
    } else {
      field += c
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    if (row.some((f) => f.trim() !== '')) rows.push(row)
  }
  return rows
}
