import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { SectionTitle } from '../components/ui'
import {
  downloadBackup,
  exportBackup,
  importBackup,
  importStarterHerdCsv,
  removeTestData,
} from '../lib/backup'
import { formatDate } from '../lib/dates'
import type { Animal } from '../types'

export default function Settings() {
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  const animals = useLiveQuery(() => db.animals.toArray(), [], [] as Animal[])
  const lastBackup = useLiveQuery(() => db.settings.get('lastBackup'), [])?.value as string | undefined
  const total = animals.filter((a) => !a.deleted).length

  async function onExport() {
    const data = await exportBackup()
    downloadBackup(data)
    await db.settings.put({ key: 'lastBackup', value: new Date().toISOString() })
    flash('Backup file created — save it somewhere safe.')
  }

  async function onImportFile(file: File) {
    setBusy(true)
    try {
      const text = await file.text()
      await importBackup(JSON.parse(text))
      flash('Backup restored.')
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Could not read that file.')
    } finally {
      setBusy(false)
    }
  }

  async function onLoadStarter() {
    setBusy(true)
    try {
      const res = await fetch(import.meta.env.BASE_URL + 'starter-herd.csv')
      if (!res.ok) throw new Error('starter-herd.csv not found')
      const text = await res.text()
      const result = await importStarterHerdCsv(text)
      flash(`Starter herd: added ${result.added}, skipped ${result.skipped} already present.`)
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Import failed.')
    } finally {
      setBusy(false)
    }
  }

  async function onLoadSample() {
    setBusy(true)
    try {
      const res = await fetch(import.meta.env.BASE_URL + 'test-herd.csv')
      if (!res.ok) throw new Error('test-herd.csv not found')
      const result = await importStarterHerdCsv(await res.text())
      flash(`Sample record loaded — ${result.added} test animals (cow 10-1 + calves).`)
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Load failed.')
    } finally {
      setBusy(false)
    }
  }

  async function onRemoveTest() {
    if (!confirm('Remove all test/demo records (anything named “TEST”)?')) return
    setBusy(true)
    try {
      const n = await removeTestData()
      flash(`Removed ${n} test records.`)
    } finally {
      setBusy(false)
    }
  }

  function flash(m: string) {
    setMsg(m)
    setTimeout(() => setMsg((cur) => (cur === m ? null : cur)), 6000)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900">More</h1>

      {msg && (
        <div className="mt-3 rounded-xl bg-cobalt-50 px-4 py-3 text-sm font-medium text-cobalt-800">{msg}</div>
      )}

      <SectionTitle>Backup &amp; restore</SectionTitle>
      <div className="card space-y-3 p-4">
        <p className="text-sm text-taupe-600">
          Your herd lives on this device and works offline. Export a backup file regularly and keep a copy safe —
          it's the current way to move data to another phone. Automatic cloud sync is the next planned step.
        </p>
        <p className="text-xs text-taupe-600">
          {total} records · last backup: {lastBackup ? formatDate(lastBackup.slice(0, 10)) : 'never'}
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={onExport} disabled={busy} className="btn-primary">Export backup</button>
          <button onClick={() => importRef.current?.click()} disabled={busy} className="btn-ghost">
            Restore from file
          </button>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onImportFile(f)
              e.target.value = ''
            }}
          />
        </div>
      </div>

      <SectionTitle>Starter herd</SectionTitle>
      <div className="card space-y-3 p-4">
        <p className="text-sm text-taupe-600">
          Loads the transcribed tag list (from the handwritten sheets) into the herd. Review the list against the
          original first — the file lives at <code className="rounded bg-taupe-100 px-1">public/starter-herd.csv</code>.
          Animals already present are skipped, so it's safe to run more than once.
        </p>
        <button onClick={onLoadStarter} disabled={busy} className="btn-ghost">
          Load starter herd from CSV
        </button>
      </div>

      <SectionTitle>Demo / sample data</SectionTitle>
      <div className="card space-y-3 p-4">
        <p className="text-sm text-taupe-600">
          Loads a real sample cow record (cow <strong>10-1</strong> and all her calves, from the old
          Individual Beef Cow Record) so you can show a working example. Every record is named
          <strong> “TEST”</strong> — tap <em>Remove test data</em> to wipe them all in one go.
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={onLoadSample} disabled={busy} className="btn-primary">Load sample record</button>
          <button onClick={onRemoveTest} disabled={busy} className="btn-danger">Remove test data</button>
        </div>
      </div>

      <SectionTitle>About sync</SectionTitle>
      <div className="card space-y-2 p-4 text-sm text-taupe-600">
        <p>
          <strong className="text-ink-800">No logins.</strong> This is built for a family operation — no accounts to
          juggle in the pasture.
        </p>
        <p>
          <strong className="text-ink-800">Multiple devices editing at once</strong> needs a shared cloud copy, which
          is the planned next phase: one simple farm code, everyone's edits merged automatically. Today each device keeps
          its own copy; use Export/Restore to move data between phones in the meantime.
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-taupe-400">Sand Creek Cattle · v0.1</p>
    </div>
  )
}
