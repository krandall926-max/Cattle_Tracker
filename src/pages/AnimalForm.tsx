import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { saveAnimal, softDeleteAnimal } from '../db/repo'
import { BackIcon } from '../components/Icons'
import { BREED_LABELS, TYPE_LABELS, STATUS_LABELS } from '../constants'
import type {
  Animal,
  AnimalStatus,
  AnimalType,
  Breed,
  RegistryCode,
  Sex,
} from '../types'

const BLANK = {
  tag: '',
  name: '',
  type: 'cow' as AnimalType,
  breed: 'black_angus' as Breed,
  sex: 'F' as Sex,
  status: 'active' as AnimalStatus,
  birthDate: '',
  purchaseDate: '',
  damId: '',
  sireId: '',
  pastureId: '',
  registryCode: '' as RegistryCode,
  notes: '',
}

// Sensible default sex when the animal type changes.
function defaultSex(type: AnimalType): Sex {
  return type === 'bull' || type === 'steer' ? 'M' : 'F'
}

export default function AnimalForm() {
  const { id } = useParams()
  const nav = useNavigate()
  const editing = Boolean(id)
  const [form, setForm] = useState({ ...BLANK })
  const [loaded, setLoaded] = useState(!editing)

  const animals = useLiveQuery(() => db.animals.toArray(), [], [] as Animal[])
  const pastures = useLiveQuery(() => db.pastures.toArray(), [], [])
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
          sex: a.sex,
          status: a.status,
          birthDate: a.birthDate ?? '',
          purchaseDate: a.purchaseDate ?? '',
          damId: a.damId ?? '',
          sireId: a.sireId ?? '',
          pastureId: a.pastureId ?? '',
          registryCode: a.registryCode ?? '',
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
      breed: form.breed,
      sex: form.sex,
      status: form.status,
      birthDate: form.birthDate || undefined,
      purchaseDate: form.purchaseDate || undefined,
      damId: form.damId || undefined,
      sireId: form.sireId || undefined,
      pastureId: form.pastureId || undefined,
      registryCode: form.registryCode || '',
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

  if (!loaded) return <p className="text-slate-500">Loading…</p>

  const isCalf = form.type === 'calf'

  return (
    <div>
      <div className="flex items-center gap-2">
        <Link to={id ? `/herd/${id}` : '/herd'} className="btn-ghost px-2 py-2">
          <BackIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">{editing ? 'Edit animal' : 'Add animal'}</h1>
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
            <select className="field-input" value={form.breed} onChange={(e) => set('breed', e.target.value as Breed)}>
              {Object.entries(BREED_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
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
          </div>
        )}

        <div>
          <label className="field-label">Pasture</label>
          <select className="field-input" value={form.pastureId} onChange={(e) => set('pastureId', e.target.value)}>
            <option value="">— unassigned —</option>
            {pastures
              .filter((p) => !p.deleted)
              .map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
          </select>
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
