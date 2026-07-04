import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { saveBreeding, softDeleteBreeding } from '../db/repo'
import { BackIcon } from '../components/Icons'
import { formatDate, relativeDays } from '../lib/dates'
import { projectedCalving } from '../lib/breeding'
import type { Animal, BreedingMethod, BreedingRecord, PregCheckResult } from '../types'

const BLANK = {
  cowId: '',
  method: 'AI' as BreedingMethod,
  aiDate: '',
  aiSire: '',
  bullId: '',
  bullTurnoutDate: '',
  bullRemovalDate: '',
  pregCheckDate: '',
  pregCheckResult: '' as '' | PregCheckResult,
  actualCalvingDate: '',
  notes: '',
}

export default function BreedingForm() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const nav = useNavigate()
  const editing = Boolean(id)
  const [form, setForm] = useState({ ...BLANK, cowId: params.get('cow') ?? '' })
  const [loaded, setLoaded] = useState(!editing)

  const animals = useLiveQuery(() => db.animals.toArray(), [], [] as Animal[])
  const cows = animals.filter((a) => !a.deleted && (a.type === 'cow' || a.type === 'heifer'))
  const bulls = animals.filter((a) => !a.deleted && a.type === 'bull')

  useEffect(() => {
    if (!editing || !id) return
    db.breedings.get(id).then((b) => {
      if (b) {
        setForm({
          cowId: b.cowId,
          method: b.method,
          aiDate: b.aiDate ?? '',
          aiSire: b.aiSire ?? '',
          bullId: b.bullId ?? '',
          bullTurnoutDate: b.bullTurnoutDate ?? '',
          bullRemovalDate: b.bullRemovalDate ?? '',
          pregCheckDate: b.pregCheckDate ?? '',
          pregCheckResult: b.pregCheckResult ?? '',
          actualCalvingDate: b.actualCalvingDate ?? '',
          notes: b.notes ?? '',
        })
      }
      setLoaded(true)
    })
  }, [editing, id])

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  // Live preview of the projected calving date as dates are entered.
  const projected = useMemo(() => {
    const stub = {
      method: form.method,
      aiDate: form.aiDate,
      bullTurnoutDate: form.bullTurnoutDate,
    } as BreedingRecord
    return projectedCalving(stub)
  }, [form.method, form.aiDate, form.bullTurnoutDate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.cowId) return
    await saveBreeding({
      ...(id ? { id } : {}),
      cowId: form.cowId,
      method: form.method,
      aiDate: form.aiDate || undefined,
      aiSire: form.aiSire.trim() || undefined,
      bullId: form.bullId || undefined,
      bullTurnoutDate: form.bullTurnoutDate || undefined,
      bullRemovalDate: form.bullRemovalDate || undefined,
      expectedCalvingDate: projected,
      pregCheckDate: form.pregCheckDate || undefined,
      pregCheckResult: form.pregCheckResult || undefined,
      actualCalvingDate: form.actualCalvingDate || undefined,
      notes: form.notes.trim() || undefined,
    })
    nav(-1)
  }

  async function onDelete() {
    if (!id) return
    if (!confirm('Delete this breeding record?')) return
    await softDeleteBreeding(id)
    nav('/breeding')
  }

  if (!loaded) return <p className="text-taupe-600">Loading…</p>

  return (
    <div>
      <div className="flex items-center gap-2">
        <button onClick={() => nav(-1)} className="btn-ghost px-2 py-2">
          <BackIcon className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-ink-900">{editing ? 'Edit breeding' : 'Log breeding'}</h1>
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div>
          <label className="field-label">Cow / heifer *</label>
          <select className="field-input" value={form.cowId} onChange={(e) => set('cowId', e.target.value)} required>
            <option value="">— select —</option>
            {cows.map((c) => (
              <option key={c.id} value={c.id}>{c.tag}{c.name ? ` · ${c.name}` : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">Method</label>
          <div className="grid grid-cols-2 gap-2">
            {(['AI', 'bull'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => set('method', m)}
                className={`btn ${form.method === m ? 'bg-cobalt-600 text-white' : 'bg-taupe-100 text-ink-700'}`}
              >
                {m === 'AI' ? 'Artificial Insemination' : 'Natural (Bull)'}
              </button>
            ))}
          </div>
        </div>

        {form.method === 'AI' ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">AI date</label>
              <input type="date" className="field-input" value={form.aiDate} onChange={(e) => set('aiDate', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Semen / sire</label>
              <input className="field-input" value={form.aiSire} onChange={(e) => set('aiSire', e.target.value)} placeholder="Sire name / code" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="field-label">Bull</label>
              <select className="field-input" value={form.bullId} onChange={(e) => set('bullId', e.target.value)}>
                <option value="">— select bull —</option>
                {bulls.map((b) => (
                  <option key={b.id} value={b.id}>{b.tag}{b.name ? ` · ${b.name}` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Turnout date</label>
              <input type="date" className="field-input" value={form.bullTurnoutDate} onChange={(e) => set('bullTurnoutDate', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Removal date</label>
              <input type="date" className="field-input" value={form.bullRemovalDate} onChange={(e) => set('bullRemovalDate', e.target.value)} />
            </div>
          </div>
        )}

        {projected && !form.actualCalvingDate && (
          <div className="rounded-xl bg-cobalt-50 px-4 py-3 text-sm font-medium text-cobalt-800">
            Projected calving: {formatDate(projected)} ({relativeDays(projected)})
          </div>
        )}

        <div className="border-t border-taupe-100 pt-4">
          <p className="mb-2 text-sm font-semibold text-ink-700">Pregnancy check</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Check date</label>
              <input type="date" className="field-input" value={form.pregCheckDate} onChange={(e) => set('pregCheckDate', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Result</label>
              <select className="field-input" value={form.pregCheckResult} onChange={(e) => set('pregCheckResult', e.target.value as PregCheckResult | '')}>
                <option value="">— not checked —</option>
                <option value="bred">Bred (pregnant)</option>
                <option value="open">Open (not pregnant)</option>
                <option value="recheck">Recheck</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="field-label">Actual calving date (once calved)</label>
          <input type="date" className="field-input" value={form.actualCalvingDate} onChange={(e) => set('actualCalvingDate', e.target.value)} />
        </div>

        <div>
          <label className="field-label">Notes</label>
          <textarea className="field-input" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1">Save</button>
          {editing && (
            <button type="button" onClick={onDelete} className="btn-danger">Delete</button>
          )}
        </div>
      </form>
    </div>
  )
}
