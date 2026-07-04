import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { EmptyState, StatusChip, StatusDot, TypeChip } from '../components/ui'
import { EarTag } from '../components/EarTag'
import { SearchIcon, PlusIcon, ChevronRight } from '../components/Icons'
import { ageFrom, formatDate } from '../lib/dates'
import type { Animal, AnimalType } from '../types'

const FILTERS: { key: AnimalType | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cow', label: 'Cows' },
  { key: 'calf', label: 'Calves' },
  { key: 'bull', label: 'Bulls' },
  { key: 'heifer', label: 'Heifers' },
  { key: 'steer', label: 'Steers' },
]

export default function Herd() {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<AnimalType | 'all'>('all')
  const [showInactive, setShowInactive] = useState(false)

  const animals = useLiveQuery(() => db.animals.toArray(), [], [] as Animal[])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return animals
      .filter((a) => !a.deleted)
      .filter((a) => (showInactive ? true : a.status === 'active'))
      .filter((a) => (filter === 'all' ? true : a.type === filter))
      .filter((a) => {
        if (!needle) return true
        return (
          a.tag.toLowerCase().includes(needle) ||
          (a.name ?? '').toLowerCase().includes(needle) ||
          (a.notes ?? '').toLowerCase().includes(needle)
        )
      })
      .sort((a, b) => a.tag.localeCompare(b.tag, undefined, { numeric: true }))
  }, [animals, q, filter, showInactive])

  const activeCount = animals.filter((a) => !a.deleted && a.status === 'active').length

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Herd</h1>
        <span className="text-sm text-taupe-600">{activeCount} active</span>
      </div>

      <div className="relative mt-3">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-taupe-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tag, name, or notes"
          className="field-input pl-10"
          inputMode="search"
          autoComplete="off"
        />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`chip shrink-0 px-3 py-1.5 ${
              filter === f.key ? 'bg-cobalt-600 text-white' : 'bg-white text-taupe-600 ring-1 ring-taupe-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm text-taupe-600">
        <input
          type="checkbox"
          checked={showInactive}
          onChange={(e) => setShowInactive(e.target.checked)}
          className="rounded border-taupe-300 text-cobalt-600 focus:ring-cobalt-500"
        />
        Include sold / deceased (history)
      </label>

      <div className="mt-3 space-y-2">
        {filtered.length === 0 ? (
          <EmptyState
            title={q ? 'No matches' : 'No animals yet'}
            hint={q ? 'Try a different search.' : 'Add your first animal or import the starter herd from More.'}
          />
        ) : (
          filtered.map((a) => <AnimalRow key={a.id} animal={a} />)
        )}
      </div>

      <Link
        to="/herd/new"
        className="fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-cobalt-600 text-white shadow-lg active:scale-95"
        aria-label="Add animal"
      >
        <PlusIcon className="h-7 w-7" />
      </Link>
    </div>
  )
}

function AnimalRow({ animal }: { animal: Animal }) {
  const born = animal.birthDate
    ? `Born ${formatDate(animal.birthDate)} · ${ageFrom(animal.birthDate)}`
    : animal.purchaseDate
      ? `Purchased ${formatDate(animal.purchaseDate)}`
      : ''
  return (
    <Link to={`/herd/${animal.id}`} className="card flex items-center gap-3 p-3 active:bg-sand-50">
      <EarTag tag={animal.tag} type={animal.type} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <StatusDot status={animal.status} />
          <span className="truncate font-semibold text-ink-900">
            {animal.name ? `${animal.tag} · ${animal.name}` : animal.tag}
          </span>
          <StatusChip status={animal.status} />
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-taupe-600">
          <TypeChip type={animal.type} />
          <span>{animal.color ? `${animal.color} ${animal.breed}` : animal.breed}</span>
          {born && <span className="truncate">· {born}</span>}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-taupe-200" />
    </Link>
  )
}
