import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { EmptyState, SectionTitle } from '../components/ui'
import { PlusIcon } from '../components/Icons'
import { formatDate, relativeDays } from '../lib/dates'
import {
  CALVING_WINDOW_LABELS,
  breedingDate,
  calvingWindow,
  projectedCalving,
  type CalvingWindow,
} from '../lib/breeding'
import type { Animal, BreedingRecord } from '../types'

const ORDER: CalvingWindow[] = ['overdue', 'due_now', 'due_soon', 'due_later']

export default function Breeding() {
  const [tab, setTab] = useState<'open' | 'all'>('open')
  const animals = useLiveQuery(() => db.animals.toArray(), [], [] as Animal[])
  const breedings = useLiveQuery(() => db.breedings.toArray(), [], [] as BreedingRecord[])

  const cowById = (id: string) => animals.find((a) => a.id === id)

  const records = useMemo(
    () => breedings.filter((b) => !b.deleted),
    [breedings],
  )

  const open = records.filter((b) => !b.actualCalvingDate && b.pregCheckResult !== 'open')
  const grouped = useMemo(() => {
    const g: Record<CalvingWindow, BreedingRecord[]> = {
      overdue: [], due_now: [], due_soon: [], due_later: [], none: [],
    }
    for (const b of open) g[calvingWindow(b)].push(b)
    for (const key of ORDER) {
      g[key].sort((a, b) => (a.expectedCalvingDate ?? projectedCalving(a) ?? '').localeCompare(b.expectedCalvingDate ?? projectedCalving(b) ?? ''))
    }
    return g
  }, [open])

  const all = [...records].sort((a, b) => (breedingDate(b) ?? '').localeCompare(breedingDate(a) ?? ''))

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Breeding &amp; AI</h1>
        <Link to="/breeding/new" className="btn-primary px-3 py-2">
          <PlusIcon className="h-5 w-5" /> Log
        </Link>
      </div>

      <div className="mt-3 flex gap-2">
        {(['open', 'all'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`chip px-3 py-1.5 ${tab === t ? 'bg-cobalt-600 text-white' : 'bg-white text-taupe-600 ring-1 ring-taupe-200'}`}
          >
            {t === 'open' ? 'Expecting' : 'All records'}
          </button>
        ))}
      </div>

      {tab === 'open' ? (
        open.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="No cows currently expecting" hint="Log an AI service or bull turnout to project calving dates." />
          </div>
        ) : (
          ORDER.map((key) =>
            grouped[key].length > 0 ? (
              <div key={key}>
                <SectionTitle>{CALVING_WINDOW_LABELS[key]} ({grouped[key].length})</SectionTitle>
                <div className="space-y-2">
                  {grouped[key].map((b) => (
                    <Row key={b.id} rec={b} cow={cowById(b.cowId)} bull={cowById(b.bullId ?? '')} />
                  ))}
                </div>
              </div>
            ) : null,
          )
        )
      ) : all.length === 0 ? (
        <div className="mt-3">
          <EmptyState title="No breeding records yet" />
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {all.map((b) => (
            <Row key={b.id} rec={b} cow={cowById(b.cowId)} bull={cowById(b.bullId ?? '')} />
          ))}
        </div>
      )}
    </div>
  )
}

function Row({ rec, cow, bull }: { rec: BreedingRecord; cow?: Animal; bull?: Animal }) {
  const due = rec.expectedCalvingDate ?? projectedCalving(rec)
  const window = calvingWindow(rec)
  const tone =
    window === 'overdue' || window === 'due_now'
      ? 'bg-red-50 text-red-700'
      : window === 'due_soon'
        ? 'bg-amber-50 text-amber-700'
        : window === 'due_later'
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-taupe-100 text-taupe-600'
  return (
    <Link to={`/breeding/${rec.id}/edit`} className="card block p-4 active:bg-sand-50">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-ink-900">{cow?.tag ?? 'Unknown cow'}</span>
        {rec.actualCalvingDate ? (
          <span className="chip bg-taupe-100 text-taupe-600">Calved</span>
        ) : (
          window !== 'none' && <span className={`chip ${tone}`}>{CALVING_WINDOW_LABELS[window]}</span>
        )}
      </div>
      <div className="mt-1 text-sm text-taupe-600">
        {rec.method === 'AI' ? `AI · ${rec.aiSire || 'sire n/a'}` : `Bull · ${bull?.tag ?? 'n/a'}`}
        {' · bred '}
        {formatDate(breedingDate(rec)) || '—'}
      </div>
      {due && !rec.actualCalvingDate && (
        <div className="mt-0.5 text-sm font-medium text-ink-700">
          Due {formatDate(due)} <span className="font-normal text-taupe-600">({relativeDays(due)})</span>
        </div>
      )}
    </Link>
  )
}
