import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { saveAnimal, softDeleteAnimal } from '../db/repo'
import { BackIcon } from '../components/Icons'
import {
  BREED_SUGGESTIONS,
  COLOR_SUGGESTIONS,
  TYPE_LABELS,
  STATUS_LABELS,
} from '../constants'
import type {
  Animal,
  AnimalStatus,
  AnimalType,
  RegistryCode,
  Sex,
} from '../types'

const BLANK = {
  tag: '',
  name: '',
  type: 'cow' as AnimalType,
  breed: 'Angus',
  color: '',
  sex: 'F' as Sex,
  status: 'active' as AnimalStatus,
  birthDate: '',
  purchaseDate: '',
  damId: '',
  sireId: '',
  sireTag: '',
  pastureId: '',
  registryCode: '' as RegistryCode,
  // Performance measurements (stored as strings in the form).
  birthWeight: '',
  weaningDate: '',
  weaningWeight: '',
  adjWeaningWeight: '',
  avgDailyGain: '',
  herdIndex: '',
  qualityScore: '',
  yearlingWeight: '',
  yearlingGain: '',
  notes: '',
}

// Sensible default sex when the animal type changes.
function defaultSex(type: AnimalType): Sex {
  return type === 'bull' || type === 'steer' ? 'M' : 'F'
}

/** Parse a numeric form field, empty → undefined. */
function num(s: string): number | undefined {
  const n = parseFloat(s)
  return s.trim() === '' || Number.isNaN(n) ? undefined : n
}

export default function AnimalForm() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const nav = useNavigate()
  const editing = Boolean(id)
  const [form, setForm] = useState(() => {
    const dam = params.get('dam')
    return dam ? { ...BLANK, type: 'calf' as AnimalType, damId: dam } : { ...BLANK }
  })
  const [loaded, setLoaded] = useState(!editing)

  const animals = useLiveQuery(() => db.animals.toArray(), [], [] as Animal[])
  const cows = animals.filter((a) => !a.deleted && (a.type === 'cow' || a.type === 'heifer'))
  const bulls = animals.filter((a) => !a.deleted && a.type === 'bull')

  useEffect(() => {
    if (!editing || !id) return
    db.animals.get(id).then((a) => {
      if (a) {
        setForm({
          tag: a.tag,
          name: a.name ?? '',
          type: a.type,
          breed: a.breed,
          color: a.color ?? '',
          sex: a.sex,
          status: a.status,
          birthDate: a.birthDate ?? '',
          purchaseDate: a.purchaseDate ?? '',
          damId: a.damId ?? '',
          sireId: a.sireId ?? '',
          sireTag: a.sireTag ?? '',
          pastureId: a.pastureId ?? '',
          registryCode: a.registryCode ?? '',
          birthWeight: a.birthWeight?.toString() ?? '',
          weaningDate: a.weaningDate ?? '',
          weaningWeight: a.weaningWeight?.toString() ?? '',
          adjWeaningWeight: a.adjWeaningWeight?.toString() ?? '',
          avgDailyGain: a.avgDailyGain?.toString() ?? '',
          herdIndex: a.herdIndex?.toString() ?? '',
          qualityScore: a.qualityScore ?? '',
          yearlingWeight: a.yearlingWeight?.toString() ?? '',
          yearlingGain: a.yearlingGain?.toString() ?? '',
          notes: a.notes ?? '',
        })
      }
      setLoaded(true)
    })
  }, [editing, id])

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.tag.trim()) return
    await saveAnimal({
      ...(id ? { id } : {}),
      tag: form.tag.trim(),
      name: form.name.trim() || undefined,
      type: form.type,
      breed: form.breed.trim() || 'Angus',
      color: form.color.trim() || undefined,
      sex: form.sex,
      status: form.status,
      birthDate: form.birthDate || undefined,
      purchaseDate: form.purchaseDate || undefined,
      damId: form.damId || undefined,
      sireId: form.sireId || undefined,
      sireTag: form.sireTag.trim() || undefined,
      pastureId: form.pastureId || undefined,
      registryCode: form.registryCode || '',
      birthWeight: num(form.birthWeight),
      weaningDate: form.weaningDate || undefined,
      weaningWeight: num(form.weaningWeight),
      adjWeaningWeight: num(form.adjWeaningWeight),
      avgDailyGain: num(form.avgDailyGain),
      herdIndex: num(form.herdIndex),
      qualityScore: form.qualityScore.trim() || undefined,
      yearlingWeight: num(form.yearlingWeight),
      yearlingGain: num(form.yearlingGain),
      notes: form.notes.trim() || undefined,
    })
    nav(id ? `/herd/${id}` : '/herd')
  }

  async function onDelete() {
    if (!id) return
    if (!confirm('Remove this animal from the herd? It stays in history and can be restored from a backup.')) return
    await softDeleteAnimal(id)
    nav('/herd')
  }

  if (!loaded) return <p className="text-taupe-600">Loading…</p>

  const isCalf = form.type === 'calf'

  return (
    <div>
      <div className="flex items-center gap-2">
        <Link to={id ? `/herd/${id}` : '/herd'} className="btn-ghost px-2 py-2">
          <BackIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-ink-900">{editing ? 'Edit animal' : 'Add animal'}</h1>
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="field-label">Tag # *</label>
            <input
              className="field-input"
              value={form.tag}
              onChange={(e) => set('tag', e.target.value)}
              placeholder="e.g. K16"
              autoFocus={!editing}
              required
            />
          </div>
          <div className="col-span-2">
            <label className="field-label">Name (optional)</label>
            <input className="field-input" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>

          <div>
            <label className="field-label">Type</label>
            <select
              className="field-input"
              value={form.type}
              onChange={(e) => {
                const type = e.target.value as AnimalType
                setForm((f) => ({ ...f, type, sex: defaultSex(type) }))
              }}
            >
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Breed</label>
            <input
              className="field-input"
              list="breed-options"
              value={form.breed}
              onChange={(e) => set('breed', e.target.value)}
              placeholder="Angus"
            />
            <datalist id="breed-options">
              {BREED_SUGGESTIONS.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="field-label">Color</label>
            <input
              className="field-input"
              list="color-options"
              value={form.color}
              onChange={(e) => set('color', e.target.value)}
              placeholder="Black"
            />
            <datalist id="color-options">
              {COLOR_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="field-label">Sex</label>
            <select className="field-input" value={form.sex} onChange={(e) => set('sex', e.target.value as Sex)}>
              <option value="F">Female</option>
              <option value="M">Male</option>
            </select>
          </div>
          <div>
            <label className="field-label">Status</label>
            <select
              className="field-input"
              value={form.status}
              onChange={(e) => set('status', e.target.value as AnimalStatus)}
            >
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Birth date</label>
            <input type="date" className="field-input" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Purchase date</label>
            <input type="date" className="field-input" value={form.purchaseDate} onChange={(e) => set('purchaseDate', e.target.value)} />
          </div>
        </div>

        {/* Cow-calf linking: only surface a dam/sire picker for calves & young stock. */}
        {(isCalf || form.type === 'heifer' || form.type === 'steer') && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Dam (mother)</label>
              <select className="field-input" value={form.damId} onChange={(e) => set('damId', e.target.value)}>
                <option value="">— none —</option>
                {cows.map((c) => (
                  <option key={c.id} value={c.id}>{c.tag}{c.name ? ` · ${c.name}` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Sire (bull)</label>
              <select className="field-input" value={form.sireId} onChange={(e) => set('sireId', e.target.value)}>
                <option value="">— none / AI —</option>
                {bulls.map((b) => (
                  <option key={b.id} value={b.id}>{b.tag}{b.name ? ` · ${b.name}` : ''}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="field-label">Sire name (AI / other)</label>
              <input className="field-input" value={form.sireTag} onChange={(e) => set('sireTag', e.target.value)} placeholder="e.g. Leddon, NS (natural service)" />
            </div>
          </div>
        )}

        {/* Performance measurements — from the Individual Beef Cow Record. */}
        <div className="border-t border-taupe-100 pt-4">
          <p className="mb-2 text-sm font-semibold text-ink-700">Performance &amp; measurements</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Birth wt (lb)</label>
              <input type="number" inputMode="decimal" className="field-input" value={form.birthWeight} onChange={(e) => set('birthWeight', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Weaning date</label>
              <input type="date" className="field-input" value={form.weaningDate} onChange={(e) => set('weaningDate', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Weaning wt (lb)</label>
              <input type="number" inputMode="decimal" className="field-input" value={form.weaningWeight} onChange={(e) => set('weaningWeight', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Adj. weaning wt</label>
              <input type="number" inputMode="decimal" className="field-input" value={form.adjWeaningWeight} onChange={(e) => set('adjWeaningWeight', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Daily gain (ADG)</label>
              <input type="number" inputMode="decimal" step="0.01" className="field-input" value={form.avgDailyGain} onChange={(e) => set('avgDailyGain', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Herd index</label>
              <input type="number" inputMode="decimal" className="field-input" value={form.herdIndex} onChange={(e) => set('herdIndex', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Quality score</label>
              <input className="field-input" value={form.qualityScore} onChange={(e) => set('qualityScore', e.target.value)} placeholder="e.g. 15.5 / Choice" />
            </div>
            <div>
              <label className="field-label">Yearling wt (lb)</label>
              <input type="number" inputMode="decimal" className="field-input" value={form.yearlingWeight} onChange={(e) => set('yearlingWeight', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Yearling gain</label>
              <input type="number" inputMode="decimal" step="0.01" className="field-input" value={form.yearlingGain} onChange={(e) => set('yearlingGain', e.target.value)} />
            </div>
          </div>
        </div>

        <div>
          <label className="field-label">Notes</label>
          <textarea className="field-input" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1">Save</button>
          {editing && (
            <button type="button" onClick={onDelete} className="btn-danger">Remove</button>
          )}
        </div>
      </form>
    </div>
  )
}
