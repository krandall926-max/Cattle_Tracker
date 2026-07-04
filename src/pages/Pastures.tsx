import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { savePasture, softDeletePasture } from '../db/repo'
import { EmptyState } from '../components/ui'
import { PlusIcon } from '../components/Icons'
import type { Animal, Pasture } from '../types'

export default function Pastures() {
  const [name, setName] = useState('')
  const [adding, setAdding] = useState(false)
  const pastures = useLiveQuery(() => db.pastures.toArray(), [], [] as Pasture[])
  const animals = useLiveQuery(() => db.animals.toArray(), [], [] as Animal[])

  const list = pastures.filter((p) => !p.deleted).sort((a, b) => a.name.localeCompare(b.name))
  const countFor = (pid: string) =>
    animals.filter((a) => !a.deleted && a.status === 'active' && a.pastureId === pid).length

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await savePasture({ name: name.trim() })
    setName('')
    setAdding(false)
  }

  async function remove(p: Pasture) {
    const n = countFor(p.id)
    const msg = n > 0
      ? `${p.name} has ${n} animal(s) assigned. Remove the pasture anyway? Those animals become unassigned.`
      : `Remove ${p.name}?`
    if (!confirm(msg)) return
    await softDeletePasture(p.id)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Pastures</h1>
        <button onClick={() => setAdding((v) => !v)} className="btn-primary px-3 py-2">
          <PlusIcon className="h-5 w-5" /> Add
        </button>
      </div>
      <p className="mt-1 text-sm text-taupe-600">
        From the ranch map. Wells &amp; gates can be added later.
      </p>

      {adding && (
        <form onSubmit={add} className="card mt-3 flex gap-2 p-3">
          <input
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Pasture name"
            autoFocus
          />
          <button type="submit" className="btn-primary">Save</button>
        </form>
      )}

      <div className="mt-3 space-y-2">
        {list.length === 0 ? (
          <EmptyState title="No pastures yet" hint="Add your first pasture." />
        ) : (
          list.map((p) => (
            <div key={p.id} className="card flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-ink-900">{p.name}</div>
                <div className="text-sm text-taupe-600">{countFor(p.id)} active animals</div>
              </div>
              <button onClick={() => remove(p)} className="btn-danger px-3 py-1.5 text-xs">Remove</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
