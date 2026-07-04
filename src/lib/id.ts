// Stable unique ids for records. crypto.randomUUID is available in every
// browser this PWA targets; the fallback keeps tests/older engines happy.
export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}
