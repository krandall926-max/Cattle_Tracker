import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { BackIcon, ChevronRight, PlusIcon } from '../components/Icons'
import { EmptyState, SectionTitle, StatusChip, TypeChip } from '../components/ui'
import { BREED_LABELS } from '../constants'
import { ageFrom, formatDate, relativeDays } from '../lib/dates'
import {
  CALVING_WINDOW_LABELS,
  breedingDate,
  calvingWindow,
  projectedCalving,
} from '../lib/breeding'
import type { Animal, BreedingRecord, Pasture } from '../types'

export default function AnimalDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const animal = useLiveQuery(() => (id ? db.animals.get(id) : undefined), [id])
  const animals = useLiveQuery(() => db.animals.toArray(), [], [] as Animal[])
  const pastures = useLiveQuery(() => db.pastures.toArray(), [], [] as Pasture[])
  const breedings = useLiveQuery(
    () => (id ? db.breedings.where('cowId').equals(id).toArray() : Promise.resolve([] as BreedingRecord[])),
    [id],
    [] as BreedingRecord[],
  )

  if (!animal) return <p className="text-slate-500">Loading…</p>

  const byId = (aid?: string) => animals.find((a) => a.id === aid)
  const dam = byId(animal.damId)
  const sire = byId(animal.sireId)
  const pasture = pastures.find((p) => p.id === animal.pastureId)
  const calves = animals.filter((a) => !a.deleted && a.damId === animal.id)
  const cowBreedings = breedings
    .filter((b) => !b.deleted)
    .sort((a, b) => (breedingDate(b) ?? '').localeCompare(breedingDate(a) ?? ''))

  const canBreed = animal.type === 'cow' || animal.type === 'heifer'

  return (
    <div>
      <div className="flex items-center gap-2">
        <button onClick={() => nav(-1)} className="btn-ghost px-2 py-2">
          <BackIcon className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">{animal.tag}</h1>
        <StatusChip status={animal.status} />
        <Link to={`/herd/${animal.id}/edit`} className="btn-ghost ml-auto">Edit</Link>
      </div>

      <div className="card mt-4 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cobalt-50 text-lg font-bold text-cobalt-700">
            {animal.tag.slice(0, 4)}
          </div>
          <div>
            {animal.name && <div className="text-lg font-bold text-slate-900">{animal.name}</div>}
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <TypeChip type={animal.type} />
              <span>{BREED_LABELS[animal.breed]}</span>
            </div>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
          <Detail label="Sex" value={animal.sex === 'F' ? 'Female' : 'Male'} />
          <Detail
            label="Age"
            value={animal.birthDate ? `${ageFrom(animal.birthDate)} (${formatDate(animal.birthDate)})` : '—'}
          />
          {animal.purchaseDate && <Detail label="Purchased" value={formatDate(animal.purchaseDate)} />}
          <Detail label="Pasture" value={pasture?.name ?? 'Unassigned'} />
          {animal.registryCode && <Detail label="Registry" value={animal.registryCode} />}
        </dl>

        {(dam || sire) && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3 text-sm">
            {dam && (
              <Link to={`/herd/${dam.id}`} className="chip bg-cobalt-50 text-cobalt-700">
                Dam: {dam.tag}
              </Link>
            )}
            {sire && (
              <Link to={`/herd/${sire.id}`} className="chip bg-slate-100 text-slate-700">
                Sire: {sire.tag}
              </Link>
            )}
          </div>
        )}

        {animal.notes && <p className="mt-3 whitespace-pre-wrap border-t border-slate-100 pt-3 text-sm text-slate-600">{animal.notes}</p>}
      </div>

      {/* Cow-calf pairs */}
      {(animal.type === 'cow' || animal.type === 'heifer') && (
        <>
          <SectionTitle>Calves ({calves.length})</SectionTitle>
          {calves.length === 0 ? (
            <EmptyState title="No calves linked yet" hint="Add a calf and set this cow as its dam." />
          ) : (
            <div className="card divide-y divide-slate-100">
              {calves
                .sort((a, b) => (b.birthDate ?? '').localeCompare(a.birthDate ?? ''))
                .map((c) => (
                  <Link key={c.id} to={`/herd/${c.id}`} className="flex items-center gap-3 px-4 py-3 active:bg-slate-50">
                    <TypeChip type={c.type} />
                    <span className="font-medium text-slate-800">{c.tag}</span>
                    <span className="text-sm text-slate-500">
                      {c.birthDate ? `Born ${formatDate(c.birthDate)}` : ''}
                    </span>
                    <ChevronRight className="ml-auto h-5 w-5 text-slate-300" />
                  </Link>
                ))}
            </div>
          )}
        </>
      )}

      {/* Breeding history */}
      {canBreed && (
        <>
          <SectionTitle
            action={
              <Link to={`/breeding/new?cow=${animal.id}`} className="flex items-center text-sm font-semibold text-cobalt-600">
                <PlusIcon className="h-4 w-4" /> Add
              </Link>
            }
          >
            Breeding & AI
          </SectionTitle>
          {cowBreedings.length === 0 ? (
            <EmptyState title="No breeding records" hint="Log an AI service or bull turnout." />
          ) : (
            <div className="space-y-2">
              {cowBreedings.map((b) => (
                <BreedingCard key={b.id} rec={b} bull={byId(b.bullId)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  )
}

function BreedingCard({ rec, bull }: { rec: BreedingRecord; bull?: Animal }) {
  const window = calvingWindow(rec)
  const due = rec.expectedCalvingDate ?? projectedCalving(rec)
  const tone =
    window === 'overdue' || window === 'due_now'
      ? 'bg-red-50 text-red-700'
      : window === 'due_soon'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-emerald-50 text-emerald-700'
  return (
    <Link to={`/breeding/${rec.id}/edit`} className="card block p-4 active:bg-slate-50">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-800">
          {rec.method === 'AI' ? `AI · ${rec.aiSire || 'sire n/a'}` : `Bull · ${bull?.tag ?? 'n/a'}`}
        </span>
        {rec.actualCalvingDate ? (
          <span className="chip bg-slate-100 text-slate-600">Calved {formatDate(rec.actualCalvingDate)}</span>
        ) : (
          window !== 'none' && <span className={`chip ${tone}`}>{CALVING_WINDOW_LABELS[window]}</span>
        )}
      </div>
      <div className="mt-1 text-sm text-slate-500">
        Bred {formatDate(breedingDate(rec)) || '—'}
        {due && !rec.actualCalvingDate && ` · due ${formatDate(due)} (${relativeDays(due)})`}
        {rec.pregCheckResult && ` · check: ${rec.pregCheckResult}`}
      </div>
    </Link>
  )
}
