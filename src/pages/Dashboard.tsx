import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { StatCard, SectionTitle } from '../components/ui'
import { BellIcon, ChevronRight, PlusIcon } from '../components/Icons'
import { calvingWindow } from '../lib/breeding'
import { daysUntil, relativeDays, todayISO } from '../lib/dates'
import type { Animal, BreedingRecord, Task } from '../types'

export default function Dashboard() {
  const animals = useLiveQuery(() => db.animals.toArray(), [], [] as Animal[])
  const breedings = useLiveQuery(() => db.breedings.toArray(), [], [] as BreedingRecord[])
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], [] as Task[])

  const live = animals.filter((a) => !a.deleted && a.status === 'active')
  const cows = live.filter((a) => a.type === 'cow').length
  const bulls = live.filter((a) => a.type === 'bull').length
  const calves = live.filter((a) => a.type === 'calf').length
  const pairs = live.filter((a) => a.type === 'calf' && a.damId).length

  const activeBreedings = breedings.filter((b) => !b.deleted)
  const windows = activeBreedings.map(calvingWindow)
  const dueNow = windows.filter((w) => w === 'due_now').length
  const dueSoon = windows.filter((w) => w === 'due_soon').length
  const dueLater = windows.filter((w) => w === 'due_later').length
  const overdue = windows.filter((w) => w === 'overdue').length

  const openTasks = tasks.filter((t) => !t.deleted && !t.done)
  const tasksToday = openTasks.filter((t) => daysUntil(t.dueDate) <= 0).length
  const tasksWeek = openTasks.filter((t) => daysUntil(t.dueDate) > 0 && daysUntil(t.dueDate) <= 7).length

  // Preg checks coming due: bred, no check yet, within ~40 days of expected calving.
  const pregChecksDue = activeBreedings.filter(
    (b) => !b.pregCheckResult && !b.actualCalvingDate && b.expectedCalvingDate,
  ).length

  const attention = overdue + tasksToday
  const farmName = useLiveQuery(() => db.settings.get('farmName'), [])?.value as string | undefined

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{farmName ?? 'Sand Creek Cattle'}</h1>
          <p className="text-sm text-slate-500">Herd overview · {todayISO()}</p>
        </div>
      </div>

      {attention > 0 ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-red-600 px-4 py-3 text-white shadow-sm">
          <BellIcon className="h-6 w-6 shrink-0" />
          <div className="text-sm font-semibold">
            {attention} {attention === 1 ? 'item needs' : 'items need'} attention
            <span className="ml-1 font-normal opacity-90">
              {overdue > 0 && `${overdue} overdue calving${overdue > 1 ? 's' : ''}`}
              {overdue > 0 && tasksToday > 0 && ' · '}
              {tasksToday > 0 && `${tasksToday} task${tasksToday > 1 ? 's' : ''} due`}
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
          All caught up — nothing overdue.
        </div>
      )}

      <SectionTitle
        action={
          <Link to="/herd/new" className="text-sm font-semibold text-cobalt-600">
            + Add animal
          </Link>
        }
      >
        Herd
      </SectionTitle>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Cows" value={cows} tone="cobalt" />
        <StatCard label="Bulls" value={bulls} />
        <StatCard label="Calves" value={calves} />
        <StatCard label="Cow-calf pairs" value={pairs} />
      </div>

      <SectionTitle
        action={
          <Link to="/breeding" className="flex items-center text-sm font-semibold text-cobalt-600">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        }
      >
        Cows ready for calving
      </SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        <CalvingCard label="Due now" value={dueNow + overdue} tone="red" />
        <CalvingCard label="Due soon" value={dueSoon} tone="amber" />
        <CalvingCard label="Due later" value={dueLater} tone="emerald" />
      </div>
      {pregChecksDue > 0 && (
        <p className="mt-2 text-sm text-slate-500">
          {pregChecksDue} breeding{pregChecksDue > 1 ? 's' : ''} awaiting a pregnancy check.
        </p>
      )}

      <SectionTitle
        action={
          <Link to="/settings" className="text-sm font-semibold text-cobalt-600">
            Manage
          </Link>
        }
      >
        Scheduled tasks
      </SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="text-3xl font-bold text-slate-900">{tasksToday}</div>
          <div className="mt-0.5 text-sm text-slate-500">Due today / overdue</div>
        </div>
        <div className="card p-4">
          <div className="text-3xl font-bold text-slate-900">{tasksWeek}</div>
          <div className="mt-0.5 text-sm text-slate-500">Later this week</div>
        </div>
      </div>
      <UpcomingTasks tasks={openTasks} />

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

function CalvingCard({ label, value, tone }: { label: string; value: number; tone: 'red' | 'amber' | 'emerald' }) {
  const dot = { red: 'bg-red-500', amber: 'bg-amber-500', emerald: 'bg-emerald-500' }[tone]
  return (
    <div className="card p-4">
      <div className="text-2xl font-bold text-slate-900">{String(value).padStart(2, '0')}</div>
      <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <span className={`h-2 w-2 rounded-full ${dot}`} /> {label}
      </div>
    </div>
  )
}

function UpcomingTasks({ tasks }: { tasks: Task[] }) {
  const soon = [...tasks]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4)
  if (soon.length === 0) return null
  return (
    <div className="card mt-3 divide-y divide-slate-100">
      {soon.map((t) => {
        const overdue = daysUntil(t.dueDate) < 0
        return (
          <div key={t.id} className="flex items-center gap-3 px-4 py-3">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${overdue ? 'bg-red-500' : 'bg-cobalt-500'}`} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-slate-800">{t.title}</div>
              <div className={`text-xs ${overdue ? 'text-red-600' : 'text-slate-500'}`}>{relativeDays(t.dueDate)}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
