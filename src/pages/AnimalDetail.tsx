import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { saveTreatment, softDeleteTreatment } from '../db/repo'
import { BackIcon, PlusIcon } from '../components/Icons'
import { EmptyState, SectionTitle, StatusChip, TypeChip } from '../components/ui'
import { EarTag } from '../components/EarTag'
import { ageFrom, formatDate, relativeDays, todayISO } from '../lib/dates'
import {
  CALVING_WINDOW_LABELS,
  breedingDate,
  calvingWindow,
  projectedCalving,
} from '../lib/breeding'
import type { Animal, BreedingRecord, Pasture, Treatment } from '../types'

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
  const treatments = useLiveQuery(
    () => (id ? db.treatments.where('animalId').equals(id).toArray() : Promise.resolve([] as Treatment[])),
    [id],
    [] as Treatment[],
  )

  if (!animal) return <p className="text-taupe-600">Loading…</p>

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
        <h1 className="text-xl font-bold text-ink-900">{animal.tag}</h1>
        <StatusChip status={animal.status} />
        <Link to={`/herd/${animal.id}/edit`} className="btn-ghost ml-auto">Edit</Link>
      </div>

      <div className="card mt-4 p-4">
        <div className="flex items-center gap-4">
          <EarTag tag={animal.tag} type={animal.type} size="lg" />
          <div>
            {animal.name && <div className="font-display text-lg font-bold text-ink-900">{animal.name}</div>}
            <div className="flex flex-wrap items-center gap-2 text-sm text-taupe-600">
              <TypeChip type={animal.type} />
              <span>{animal.color ? `${animal.color} ${animal.breed}` : animal.breed}</span>
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
          {pasture && <Detail label="Pasture" value={pasture.name} />}
          {animal.registryCode && (
            <Detail
              label="Marking"
              value={`${animal.registryCode}${animal.registryCode === 'Val' ? ' · baldy' : animal.registryCode === 'Gen' ? ' · solid' : ''}`}
            />
          )}
        </dl>

        {(dam || sire) && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-taupe-100 pt-3 text-sm">
            {dam && (
              <Link to={`/herd/${dam.id}`} className="chip bg-cobalt-50 text-cobalt-700">
                Dam: {dam.tag}
              </Link>
            )}
            {sire && (
              <Link to={`/herd/${sire.id}`} className="chip bg-taupe-100 text-ink-700">
                Sire: {sire.tag}
              </Link>
            )}
          </div>
        )}

        {animal.notes && <p className="mt-3 whitespace-pre-wrap border-t border-taupe-100 pt-3 text-sm text-taupe-600">{animal.notes}</p>}
      </div>

      {/* This animal's own performance numbers */}
      {hasPerformance(animal) && (
        <>
          <SectionTitle>Performance</SectionTitle>
          <dl className="card grid grid-cols-2 gap-y-3 p-4 text-sm sm:grid-cols-3">
            {animal.birthWeight != null && <Detail label="Birth wt" value={`${animal.birthWeight} lb`} />}
            {animal.weaningWeight != null && <Detail label="Weaning wt" value={`${animal.weaningWeight} lb`} />}
            {animal.weaningDate && <Detail label="Weaned" value={formatDate(animal.weaningDate)} />}
            {animal.adjWeaningWeight != null && <Detail label="Adj. weaning" value={String(animal.adjWeaningWeight)} />}
            {animal.avgDailyGain != null && <Detail label="Daily gain" value={String(animal.avgDailyGain)} />}
            {animal.herdIndex != null && <Detail label="Herd index" value={String(animal.herdIndex)} />}
            {animal.qualityScore && <Detail label="Quality score" value={animal.qualityScore} />}
            {animal.yearlingWeight != null && <Detail label="Yearling wt" value={`${animal.yearlingWeight} lb`} />}
            {animal.yearlingGain != null && <Detail label="Yearling gain" value={String(animal.yearlingGain)} />}
          </dl>
        </>
      )}

      {/* Calf record — the cow's produce history, all calves in one view,
          modeled on the Individual Beef Cow Record sheet. Tap a row for detail. */}
      {(animal.type === 'cow' || animal.type === 'heifer') && (
        <>
          <SectionTitle
            action={
              <Link to={`/herd/new?dam=${animal.id}`} className="flex items-center text-sm font-semibold text-cobalt-600">
                <PlusIcon className="h-4 w-4" /> Add calf
              </Link>
            }
          >
            Calf record ({calves.length})
          </SectionTitle>
          {calves.length === 0 ? (
            <EmptyState title="No calves linked yet" hint="Add a calf and set this cow as its dam." />
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead>
                  <tr className="border-b border-taupe-200 text-left text-[11px] uppercase tracking-wide text-taupe-400">
                    <th className="px-3 py-2 font-semibold">Year</th>
                    <th className="px-2 py-2 font-semibold">Tag</th>
                    <th className="px-2 py-2 font-semibold">Sex</th>
                    <th className="px-2 py-2 font-semibold">Sire</th>
                    <th className="px-2 py-2 text-right font-semibold" title="Birth weight">BW</th>
                    <th className="px-2 py-2 text-right font-semibold" title="Weaning weight">WW</th>
                    <th className="px-2 py-2 text-right font-semibold" title="Adjusted weaning weight">Adj</th>
                    <th className="px-2 py-2 text-right font-semibold" title="Avg daily gain">ADG</th>
                    <th className="px-2 py-2 text-right font-semibold" title="Herd index">Idx</th>
                    <th className="px-3 py-2 text-right font-semibold" title="Quality score">QS</th>
                  </tr>
                </thead>
                <tbody>
                  {calves
                    .sort((a, b) => (b.birthDate ?? '').localeCompare(a.birthDate ?? ''))
                    .map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => nav(`/herd/${c.id}`)}
                        className="cursor-pointer border-b border-taupe-100 last:border-0 hover:bg-sand-50"
                      >
                        <td className="px-3 py-2 text-taupe-600">{c.birthDate ? c.birthDate.slice(0, 4) : '—'}</td>
                        <td className="whitespace-nowrap px-2 py-2 font-semibold text-cobalt-700">{c.tag}</td>
                        <td className="px-2 py-2">{sexLetter(c)}</td>
                        <td className="whitespace-nowrap px-2 py-2 text-taupe-600">{byId(c.sireId)?.tag ?? c.sireTag ?? '—'}</td>
                        <td className="px-2 py-2 text-right tabular-nums">{c.birthWeight ?? ''}</td>
                        <td className="px-2 py-2 text-right tabular-nums">{c.weaningWeight ?? ''}</td>
                        <td className="px-2 py-2 text-right tabular-nums">{c.adjWeaningWeight ?? ''}</td>
                        <td className="px-2 py-2 text-right tabular-nums">{c.avgDailyGain ?? ''}</td>
                        <td className="px-2 py-2 text-right tabular-nums">{c.herdIndex ?? ''}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{c.qualityScore ?? ''}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
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

      {/* Medicine / treatment log — for every animal */}
      <Treatments animalId={animal.id} items={treatments.filter((t) => !t.deleted)} />
    </div>
  )
}

const BLANK_TREATMENT = { date: todayISO(), product: '', dose: '', route: '', notes: '' }

function Treatments({ animalId, items }: { animalId: string; items: Treatment[] }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ ...BLANK_TREATMENT })
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date))

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form.product.trim()) return
    await saveTreatment({
      animalId,
      date: form.date || todayISO(),
      product: form.product.trim(),
      dose: form.dose.trim() || undefined,
      route: form.route.trim() || undefined,
      notes: form.notes.trim() || undefined,
    })
    setForm({ ...BLANK_TREATMENT })
    setAdding(false)
  }

  return (
    <>
      <SectionTitle
        action={
          <button onClick={() => setAdding((v) => !v)} className="flex items-center text-sm font-semibold text-cobalt-600">
            <PlusIcon className="h-4 w-4" /> Add
          </button>
        }
      >
        Medicine &amp; treatments
      </SectionTitle>

      {adding && (
        <form onSubmit={save} className="card mb-2 space-y-3 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Date</label>
              <input type="date" className="field-input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="field-label">Product *</label>
              <input className="field-input" value={form.product} onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))} placeholder="e.g. UltraBac 7" required />
            </div>
            <div>
              <label className="field-label">Dose</label>
              <input className="field-input" value={form.dose} onChange={(e) => setForm((f) => ({ ...f, dose: e.target.value }))} placeholder="e.g. 5 ml" />
            </div>
            <div>
              <label className="field-label">Route</label>
              <input className="field-input" list="route-options" value={form.route} onChange={(e) => setForm((f) => ({ ...f, route: e.target.value }))} placeholder="SubQ" />
              <datalist id="route-options">
                <option value="SubQ" /><option value="IM" /><option value="Oral" /><option value="Topical" /><option value="IV" />
              </datalist>
            </div>
          </div>
          <div>
            <label className="field-label">Notes</label>
            <input className="field-input" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary w-full">Save treatment</button>
        </form>
      )}

      {sorted.length === 0 ? (
        <EmptyState title="No treatments logged" hint="Record vaccinations, dewormer, antibiotics, etc." />
      ) : (
        <div className="card divide-y divide-taupe-100">
          {sorted.map((t) => (
            <div key={t.id} className="flex items-start gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-ink-800">
                  {t.product}
                  {t.dose && <span className="font-normal text-taupe-600"> · {t.dose}</span>}
                  {t.route && <span className="font-normal text-taupe-600"> · {t.route}</span>}
                </div>
                <div className="text-xs text-taupe-600">
                  {formatDate(t.date)}
                  {t.notes && ` · ${t.notes}`}
                </div>
              </div>
              <button
                onClick={() => softDeleteTreatment(t.id)}
                className="text-xs font-semibold text-taupe-400 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

/** Short sex/class letter for the calf record: Steer, Heifer, Bull, Cow. */
function sexLetter(a: Animal): string {
  if (a.type === 'steer') return 'S'
  if (a.type === 'heifer') return 'H'
  if (a.type === 'bull') return 'B'
  if (a.type === 'cow') return 'C'
  return a.sex
}

function hasPerformance(a: Animal): boolean {
  return (
    a.birthWeight != null ||
    a.weaningWeight != null ||
    a.adjWeaningWeight != null ||
    a.avgDailyGain != null ||
    a.herdIndex != null ||
    a.yearlingWeight != null ||
    a.yearlingGain != null ||
    Boolean(a.qualityScore) ||
    Boolean(a.weaningDate)
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-taupe-400">{label}</dt>
      <dd className="font-medium text-ink-800">{value}</dd>
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
    <Link to={`/breeding/${rec.id}/edit`} className="card block p-4 active:bg-sand-50">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-ink-800">
          {rec.method === 'AI' ? `AI · ${rec.aiSire || 'sire n/a'}` : `Bull · ${bull?.tag ?? 'n/a'}`}
        </span>
        {rec.actualCalvingDate ? (
          <span className="chip bg-taupe-100 text-taupe-600">Calved {formatDate(rec.actualCalvingDate)}</span>
        ) : (
          window !== 'none' && <span className={`chip ${tone}`}>{CALVING_WINDOW_LABELS[window]}</span>
        )}
      </div>
      <div className="mt-1 text-sm text-taupe-600">
        Bred {formatDate(breedingDate(rec)) || '—'}
        {due && !rec.actualCalvingDate && ` · due ${formatDate(due)} (${relativeDays(due)})`}
        {rec.pregCheckResult && ` · check: ${rec.pregCheckResult}`}
      </div>
    </Link>
  )
}
