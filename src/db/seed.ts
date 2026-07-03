import { db } from './db'
import { savePasture } from './repo'
import { SEED_PASTURES } from '../constants'

// Runs once on first launch: drops in the ranch's pasture names so the app
// isn't empty. Guarded by a setting so it never double-seeds.
export async function seedIfNeeded(): Promise<void> {
  const flag = await db.settings.get('seeded_v1')
  if (flag?.value) return

  const existing = await db.pastures.count()
  if (existing === 0) {
    for (const name of SEED_PASTURES) {
      await savePasture({ name })
    }
  }

  await db.settings.put({ key: 'seeded_v1', value: true })
  await db.settings.put({ key: 'farmName', value: 'Sand Creek Cattle' })
}
