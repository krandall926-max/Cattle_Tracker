import { db } from '../db/db'
import { saveAnimal, saveBreeding } from '../db/repo'
import { newId } from './id'
import { todayISO } from './dates'
import { projectedCalving } from './breeding'
import type { Animal, AnimalType, RegistryCode, Sex } from '../types'
import { TYPE_LABELS } from '../constants'

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

// ---- Herd spreadsheet import ------------------------------------------------
//
// Column-driven so the same importer reads the transcribed starter CSV and the
// fill-in template. Headers are matched loosely (case-insensitive, with a few
// aliases). "Black Angus"/"Red Angus" split into breed "Angus" + a color; a
// separate Color column wins if present. Dam links resolve by tag, and an AI
// Date / Semen creates a breeding record automatically.

const TYPE_BY_LABEL: Record<string, AnimalType> = Object.fromEntries(
  Object.entries(TYPE_LABELS).map(([k, v]) => [v.toLowerCase(), k as AnimalType]),
) as Record<string, AnimalType>

function parseType(raw: string): AnimalType {
  const t = raw.trim().toLowerCase()
  if (!t) return 'cow'
  if (TYPE_BY_LABEL[t]) return TYPE_BY_LABEL[t]
  if (['cow', 'bull', 'calf', 'heifer', 'steer', 'show', 'horse', 'pig', 'donkey'].includes(t)) {
    return t as AnimalType
  }
  return 'cow'
}

function parseSex(raw: string, type: AnimalType): Sex {
  const s = raw.trim().toUpperCase()
  if (s.startsWith('M')) return 'M'
  if (s.startsWith('F')) return 'F'
  return type === 'bull' || type === 'steer' ? 'M' : 'F'
}

/** Split legacy "Black Angus"/"Red Angus" into breed + color. */
function parseBreedColor(rawBreed: string, rawColor: string): { breed: string; color?: string } {
  const breed = rawBreed.trim()
  const color = rawColor.trim()
  const lower = breed.toLowerCase()
  if (lower === 'black angus') return { breed: 'Angus', color: color || 'Black' }
  if (lower === 'red angus') return { breed: 'Angus', color: color || 'Red' }
  return { breed: breed || 'Angus', color: color || undefined }
}

export interface CsvImportResult {
  added: number
  skipped: number
  total: number
  breedings: number
}

export async function importStarterHerdCsv(text: string): Promise<CsvImportResult> {
  const rows = parseCsv(text)
  if (rows.length === 0) return { added: 0, skipped: 0, total: 0, breedings: 0 }
  const header = rows[0].map((h) => h.trim().toLowerCase())
  const idx = (...names: string[]) => {
    for (const n of names) {
      const i = header.indexOf(n)
      if (i !== -1) return i
    }
    return -1
  }
  const col = {
    tag: idx('tag', 'tag #', 'tag#', 'tag number'),
    name: idx('name'),
    type: idx('type'),
    breed: idx('breed'),
    color: idx('color', 'colour'),
    sex: idx('sex'),
    status: idx('status'),
    birth: idx('birth date', 'birthdate', 'born', 'dob'),
    purchase: idx('purchase date', 'purchased'),
    dam: idx('dam tag', 'dam', 'mother'),
    sire: idx('sire tag', 'sire'),
    registry: idx('registry', 'registry (gen/val)', 'gen/val', 'marking'),
    aiDate: idx('ai date', 'ai'),
    semen: idx('semen/sire', 'semen', 'semen / sire', 'ai sire'),
    birthWt: idx('birth wt', 'birth weight', 'bw'),
    weaningDate: idx('weaning date', 'weaned'),
    weaningWt: idx('weaning wt', 'weaning weight', 'ww'),
    adjWt: idx('adj weaning wt', 'adj. weaning wt', 'adjusted weaning wt', 'adj ww'),
    adg: idx('daily gain', 'adg', 'avg daily gain'),
    herdIndex: idx('herd index', 'index'),
    qualityScore: idx('quality score', 'quality', 'qs'),
    yearlingWt: idx('yearling wt', 'yearling weight'),
    yearlingGain: idx('yearling gain'),
    notes: idx('notes', 'remarks'),
  }
  const cell = (row: string[], i: number) => (i === -1 ? '' : (row[i] ?? '').trim())
  const numCell = (row: string[], i: number) => {
    const v = parseFloat(cell(row, i))
    return Number.isNaN(v) ? undefined : v
  }

  const existing = await db.animals.toArray()
  const byTag = new Map<string, string>() // upper(tag) -> id
  for (const a of existing) if (!a.deleted) byTag.set(a.tag.toUpperCase(), a.id)

  let added = 0
  let skipped = 0
  let breedings = 0
  const damLinks: { childId: string; damTag: string }[] = []

  for (const row of rows.slice(1)) {
    const tag = cell(row, col.tag)
    if (!tag) continue
    if (byTag.has(tag.toUpperCase())) {
      skipped++
      continue
    }
    const type = parseType(cell(row, col.type))
    const { breed, color } = parseBreedColor(cell(row, col.breed), cell(row, col.color))
    const sex = parseSex(cell(row, col.sex), type)
    const registry = cell(row, col.registry)
    const statusRaw = cell(row, col.status).toLowerCase()
    const status = (['active', 'sold', 'deceased', 'cull'] as const).find((s) => s === statusRaw) ?? 'active'

    const id = newId()
    await saveAnimal({
      id,
      tag,
      name: cell(row, col.name) || undefined,
      type,
      breed,
      color,
      sex,
      status,
      birthDate: cell(row, col.birth) || undefined,
      purchaseDate: cell(row, col.purchase) || undefined,
      sireTag: cell(row, col.sire) || undefined,
      registryCode: (registry === 'Gen' || registry === 'Val' ? registry : '') as RegistryCode,
      birthWeight: numCell(row, col.birthWt),
      weaningDate: cell(row, col.weaningDate) || undefined,
      weaningWeight: numCell(row, col.weaningWt),
      adjWeaningWeight: numCell(row, col.adjWt),
      avgDailyGain: numCell(row, col.adg),
      herdIndex: numCell(row, col.herdIndex),
      qualityScore: cell(row, col.qualityScore) || undefined,
      yearlingWeight: numCell(row, col.yearlingWt),
      yearlingGain: numCell(row, col.yearlingGain),
      notes: cell(row, col.notes) || undefined,
    })
    byTag.set(tag.toUpperCase(), id)
    added++

    const damTag = cell(row, col.dam)
    if (damTag) damLinks.push({ childId: id, damTag })

    const aiDate = cell(row, col.aiDate)
    const semen = cell(row, col.semen)
    if (aiDate || semen) {
      await saveBreeding({
        cowId: id,
        method: 'AI',
        aiDate: aiDate || undefined,
        aiSire: semen || undefined,
        expectedCalvingDate: aiDate ? projectedCalving({ method: 'AI', aiDate } as never) : undefined,
      })
      breedings++
    }
  }

  // Second pass: resolve dam links now that every tag is known.
  for (const { childId, damTag } of damLinks) {
    const damId = byTag.get(damTag.toUpperCase())
    if (damId) {
      const child = await db.animals.get(childId)
      if (child) await saveAnimal({ ...child, damId })
    }
  }

  return { added, skipped, total: rows.length - 1, breedings }
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
