import type { ReactNode } from 'react'
import type { AnimalStatus, AnimalType } from '../types'
import { STATUS_LABELS, TYPE_LABELS } from '../constants'
import { BrandMark } from './Brand'

// Shared presentational bits used across screens.

const ACCENTS = {
  ink: 'text-ink-900',
  cobalt: 'text-cobalt-600',
  emerald: 'text-emerald-600',
  amber: 'text-amber-600',
  red: 'text-red-600',
} as const

export function StatCard({
  label,
  value,
  accent = 'ink',
  sub,
}: {
  label: string
  value: ReactNode
  accent?: keyof typeof ACCENTS
  sub?: ReactNode
}) {
  return (
    <div className="card p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-taupe-400">{label}</div>
      <div className={`mt-1 font-display text-3xl font-bold ${ACCENTS[accent]}`}>{value}</div>
      {sub && <div className="mt-1 text-xs font-medium text-taupe-600">{sub}</div>}
    </div>
  )
}

const TYPE_TONES: Record<AnimalType, string> = {
  cow: 'bg-cobalt-50 text-cobalt-700',
  bull: 'bg-ink-800 text-white',
  calf: 'bg-amber-100 text-amber-800',
  heifer: 'bg-emerald-100 text-emerald-800',
  steer: 'bg-red-100 text-red-800',
}

export function TypeChip({ type }: { type: AnimalType }) {
  return <span className={`chip ${TYPE_TONES[type]}`}>{TYPE_LABELS[type]}</span>
}

const STATUS_TONES: Record<AnimalStatus, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  sold: 'bg-taupe-200 text-taupe-600',
  deceased: 'bg-taupe-200 text-taupe-600',
  cull: 'bg-amber-100 text-amber-800',
}

export function StatusChip({ status }: { status: AnimalStatus }) {
  if (status === 'active') return null
  return <span className={`chip ${STATUS_TONES[status]}`}>{STATUS_LABELS[status]}</span>
}

/** Small colored dot for at-a-glance status in list rows (RanchTracker style). */
export function StatusDot({ status }: { status: AnimalStatus }) {
  const tone =
    status === 'active' ? 'bg-emerald-500' : status === 'cull' ? 'bg-amber-500' : 'bg-taupe-400'
  return <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tone}`} />
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="card p-8 text-center text-taupe-600">
      <BrandMark className="mx-auto mb-3 h-12 w-12 opacity-25 grayscale" />
      <p className="font-medium text-ink-700">{title}</p>
      {hint && <p className="mt-1 text-sm">{hint}</p>}
    </div>
  )
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 mt-6 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-lg font-bold text-ink-800">
        <span className="h-5 w-1.5 rounded-full bg-cobalt-600" />
        {children}
      </h2>
      {action}
    </div>
  )
}
