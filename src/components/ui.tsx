import type { ReactNode } from 'react'
import type { AnimalStatus, AnimalType } from '../types'
import { STATUS_LABELS, TYPE_LABELS } from '../constants'
import { BrandMark } from './Brand'

// Shared presentational bits used across screens.

export function StatCard({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: ReactNode
  tone?: 'default' | 'cobalt'
}) {
  return (
    <div className={`card p-4 ${tone === 'cobalt' ? 'bg-cobalt-600 text-white ring-cobalt-700' : ''}`}>
      <div className={`font-display text-3xl font-bold ${tone === 'cobalt' ? 'text-white' : 'text-slate-900'}`}>{value}</div>
      <div className={`mt-0.5 text-sm ${tone === 'cobalt' ? 'text-cobalt-100' : 'text-slate-500'}`}>{label}</div>
    </div>
  )
}

const TYPE_TONES: Record<AnimalType, string> = {
  cow: 'bg-cobalt-50 text-cobalt-700',
  bull: 'bg-slate-800 text-white',
  calf: 'bg-amber-100 text-amber-800',
  heifer: 'bg-emerald-100 text-emerald-800',
  steer: 'bg-rose-100 text-rose-800',
}

export function TypeChip({ type }: { type: AnimalType }) {
  return <span className={`chip ${TYPE_TONES[type]}`}>{TYPE_LABELS[type]}</span>
}

const STATUS_TONES: Record<AnimalStatus, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  sold: 'bg-slate-200 text-slate-700',
  deceased: 'bg-slate-200 text-slate-500',
  cull: 'bg-amber-100 text-amber-800',
}

export function StatusChip({ status }: { status: AnimalStatus }) {
  if (status === 'active') return null
  return <span className={`chip ${STATUS_TONES[status]}`}>{STATUS_LABELS[status]}</span>
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="card p-8 text-center text-slate-500">
      <BrandMark className="mx-auto mb-3 h-12 w-12 opacity-30 grayscale" />
      <p className="font-medium text-slate-600">{title}</p>
      {hint && <p className="mt-1 text-sm">{hint}</p>}
    </div>
  )
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 mt-6 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
        <span className="h-5 w-1.5 rounded-full bg-leather-600" />
        {children}
      </h2>
      {action}
    </div>
  )
}
