import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { StatCard, SectionTitle } from '../components/ui'
import {
  BellIcon,
  ChevronRight,
  PlusIcon,
  HerdIcon,
  BreedingIcon,
  PastureIcon,
} from '../components/Icons'
import { BrandMark } from '../components/Brand'
import { calvingWindow } from '../lib/breeding'
import { daysUntil, formatDate, relativeDays } from '../lib/dates'
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
  const pregChecksDue = activeBreedings.filter(
    (b) => !b.pregCheckResult && !b.actualCalvingDate && b.expectedCalvingDate,
  ).length

  const attention = overdue + tasksToday
  const farmName = useLiveQuery(() => db.settings.get('farmName'), [])?.value as string | undefined

  return (
    <div>
      {/* Ranch header — neutral charcoal band, cobalt stays an accent */}
      <div className="relative overflow-hidden rounded-2xl bg-ink-800 px-5 py-5 text-white">
        <BrandMark className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 opacity-[0.07] grayscale" />
        <div className="text-sm text-taupe-200/90">Herd overview · {formatDate(todayString())}</div>
        <h1 className="mt-0.5 font-display text-2xl font-bold">{farmName ?? 'Sand Creek Cattle'}</h1>
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

      {/* Key numbers */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatCard label="Total head" value={live.length} sub={`${cows} cows · ${calves} calves`} />
        <StatCard
          label="Due to calve"
          value={dueNow + overdue}
          accent={dueNow + overdue > 0 ? 'red' : 'ink'}
          sub="due now / overdue"
        />
        <StatCard label="Cow-calf pairs" value={pairs} accent="cobalt" />
        <StatCard
          label="Tasks today"
          value={tasksToday}
          accent={tasksToday > 0 ? 'amber' : 'ink'}
          sub={pregChecksDue > 0 ? `${pregChecksDue} preg checks pending` : 'all clear'}
        />
      </div>

      {/* Quick actions — tiles, no clutter */}
      <SectionTitle>Quick actions</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <QuickTile to="/herd/new" label="Add animal" hint="New cow, calf or bull" Icon={PlusIcon} tone="cobalt" />
        <QuickTile to="/breeding/new" label="Log breeding" hint="AI or bull turnout" Icon={BreedingIcon} tone="emerald" />
        <QuickTile to="/herd" label="The herd" hint="Search & records" Icon={HerdIcon} tone="ink" />
        <QuickTile to="/pastures" label="Pastures" hint="From the ranch map" Icon={PastureIcon} tone="leather" />
      </div>

      {/* Calving windows */}
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

      {/* Herd breakdown */}
      <SectionTitle>Herd breakdown</SectionTitle>
      <div className="card flex divide-x divide-taupe-200">
        <Breakdown label="Cows" value={cows} />
        <Breakdown label="Bulls" value={bulls} />
        <Breakdown label="Calves" value={calves} />
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

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

const TILE_TONES = {
  cobalt: 'bg-cobalt-50 text-cobalt-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  ink: 'bg-taupe-100 text-ink-700',
  leather: 'bg-orange-50 text-leather-600',
} as const

function QuickTile({
  to,
  label,
  hint,
  Icon,
  tone,
}: {
  to: string
  label: string
  hint: string
  Icon: (p: { className?: string }) => JSX.Element
  tone: keyof typeof TILE_TONES
}) {
  return (
    <Link to={to} className="card flex items-center gap-3 p-3.5 active:bg-sand-50">
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${TILE_TONES[tone]}`}>
        <Icon className="h-6 w-6" />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-ink-800">{label}</span>
        <span className="block truncate text-xs text-taupe-600">{hint}</span>
      </span>
    </Link>
  )
}

function CalvingCard({ label, value, tone }: { label: string; value: number; tone: 'red' | 'amber' | 'emerald' }) {
  const dot = { red: 'bg-red-500', amber: 'bg-amber-500', emerald: 'bg-emerald-500' }[tone]
  return (
    <div className="card p-4">
      <div className="font-display text-2xl font-bold text-ink-900">{String(value).padStart(2, '0')}</div>
      <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-taupe-600">
        <span className={`h-2 w-2 rounded-full ${dot}`} /> {label}
      </div>
    </div>
  )
}

function Breakdown({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 px-4 py-3 text-center">
      <div className="font-display text-2xl font-bold text-ink-900">{value}</div>
      <div className="text-xs font-medium text-taupe-600">{label}</div>
    </div>
  )
}

function UpcomingTasks({ tasks }: { tasks: Task[] }) {
  const soon = [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4)
  if (soon.length === 0) return null
  return (
    <>
      <SectionTitle>Upcoming tasks</SectionTitle>
      <div className="card divide-y divide-taupe-100">
        {soon.map((t) => {
          const overdue = daysUntil(t.dueDate) < 0
          return (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${overdue ? 'bg-red-500' : 'bg-cobalt-500'}`} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-ink-800">{t.title}</div>
                <div className={`text-xs ${overdue ? 'text-red-600' : 'text-taupe-600'}`}>{relativeDays(t.dueDate)}</div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
