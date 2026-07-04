import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { saveTask, softDeleteTask } from '../db/repo'
import { EmptyState, SectionTitle } from '../components/ui'
import { PlusIcon, CheckIcon } from '../components/Icons'
import { TASK_CATEGORY_LABELS } from '../constants'
import { daysUntil, formatDate, relativeDays, todayISO } from '../lib/dates'
import type { Animal, Task, TaskCategory } from '../types'

// The Schedule: a subject + a date. Powers AI scheduling and any reminder
// (pregnancy checks, vaccinations, medicine, moves…). Overdue/soon items also
// surface on the dashboard.
const BLANK = {
  title: '',
  dueDate: todayISO(),
  category: 'ai' as TaskCategory,
  animalId: '',
  notes: '',
}

export default function Schedule() {
  const [form, setForm] = useState({ ...BLANK })
  const [adding, setAdding] = useState(false)
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], [] as Task[])
  const animals = useLiveQuery(() => db.animals.toArray(), [], [] as Animal[])
  const activeAnimals = animals
    .filter((a) => !a.deleted && a.status === 'active')
    .sort((a, b) => a.tag.localeCompare(b.tag, undefined, { numeric: true }))
  const tagOf = (aid?: string) => animals.find((a) => a.id === aid)?.tag

  const { upcoming, done } = useMemo(() => {
    const live = tasks.filter((t) => !t.deleted)
    return {
      upcoming: live.filter((t) => !t.done).sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
      done: live.filter((t) => t.done).sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
    }
  }, [tasks])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    await saveTask({
      title: form.title.trim(),
      dueDate: form.dueDate || todayISO(),
      category: form.category,
      animalId: form.animalId || undefined,
      notes: form.notes.trim() || undefined,
      done: false,
    })
    setForm({ ...BLANK })
    setAdding(false)
  }

  async function toggle(t: Task) {
    await saveTask({ ...t, done: !t.done })
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Schedule</h1>
        <button onClick={() => setAdding((v) => !v)} className="btn-primary px-3 py-2">
          <PlusIcon className="h-5 w-5" /> New
        </button>
      </div>
      <p className="mt-1 text-sm text-taupe-600">AI dates, pregnancy checks, vaccinations, medicine &amp; reminders.</p>

      {adding && (
        <form onSubmit={add} className="card mt-3 space-y-3 p-4">
          <div>
            <label className="field-label">Subject *</label>
            <input
              className="field-input"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. AI heifers, Blackleg boosters…"
              autoFocus
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Date</label>
              <input type="date" className="field-input" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div>
              <label className="field-label">Type</label>
              <select className="field-input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as TaskCategory }))}>
                {Object.entries(TASK_CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="field-label">Animal (optional)</label>
            <select className="field-input" value={form.animalId} onChange={(e) => setForm((f) => ({ ...f, animalId: e.target.value }))}>
              <option value="">— none / whole group —</option>
              {activeAnimals.map((a) => (
                <option key={a.id} value={a.id}>{a.tag}{a.name ? ` · ${a.name}` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Notes</label>
            <input className="field-input" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary w-full">Add to schedule</button>
        </form>
      )}

      <SectionTitle>Upcoming ({upcoming.length})</SectionTitle>
      {upcoming.length === 0 ? (
        <EmptyState title="Nothing scheduled" hint="Add an AI date or reminder above." />
      ) : (
        <div className="space-y-2">
          {upcoming.map((t) => (
            <TaskRow key={t.id} t={t} tag={tagOf(t.animalId)} onToggle={() => toggle(t)} onDelete={() => softDeleteTask(t.id)} />
          ))}
        </div>
      )}

      {done.length > 0 && (
        <>
          <SectionTitle>Done</SectionTitle>
          <div className="space-y-2 opacity-70">
            {done.slice(0, 20).map((t) => (
              <TaskRow key={t.id} t={t} tag={tagOf(t.animalId)} onToggle={() => toggle(t)} onDelete={() => softDeleteTask(t.id)} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function TaskRow({
  t,
  tag,
  onToggle,
  onDelete,
}: {
  t: Task
  tag?: string
  onToggle: () => void
  onDelete: () => void
}) {
  const overdue = !t.done && daysUntil(t.dueDate) < 0
  return (
    <div className="card flex items-center gap-3 p-3.5">
      <button
        onClick={onToggle}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
          t.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-taupe-300 text-transparent'
        }`}
        aria-label={t.done ? 'Mark not done' : 'Mark done'}
      >
        <CheckIcon className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <div className={`font-medium ${t.done ? 'text-taupe-600 line-through' : 'text-ink-800'}`}>{t.title}</div>
        <div className={`text-xs ${overdue ? 'font-semibold text-red-600' : 'text-taupe-600'}`}>
          {TASK_CATEGORY_LABELS[t.category]} · {formatDate(t.dueDate)}
          {!t.done && ` (${relativeDays(t.dueDate)})`}
          {tag && ` · ${tag}`}
        </div>
      </div>
      <button onClick={onDelete} className="text-xs font-semibold text-taupe-400 hover:text-red-600">
        Remove
      </button>
    </div>
  )
}
