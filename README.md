# Sand Creek Cattle

A simple, offline-first cow-calf & breeding tracker built for Sand Creek Cattle.
It runs as an installable web app (PWA): open it once on a phone, tap **Add to
Home Screen**, and it works like a normal app — full screen, its own icon, and
**fully functional with no cell signal**. All data is stored on the device, so
you can add and search records out in the pasture and it just works.

## What it does (v1)

- **Herd inventory** — add/edit cows, bulls, calves, heifers, steers with tag #,
  breed (Black Angus, Red Angus, Milk Cow), sex, status, birth/purchase dates,
  pasture, and notes. Fast offline search across tag, name, and notes, including
  historical (sold/deceased) animals.
- **Cow-calf pairs** — link each calf to its **dam** (and optional sire). A cow's
  page lists all her calves; a calf links back to its parents.
- **Breeding & AI** — log AI services (date + semen/sire) or natural bull
  turnout, auto-project the **expected calving date** (gestation ≈ 283 days),
  record pregnancy checks, and mark actual calving. The Breeding screen groups
  cows by how close they are to calving.
- **Dashboard** — herd counts, cows due to calve (now / soon / later), scheduled
  tasks, and an attention banner for anything overdue.
- **Pastures** — the ranch's pastures from the map; assign animals to a pasture.
  (Wells & gates can be layered on later.)
- **Backup & restore** — export all data to a single JSON file and restore it on
  another device. This is the current way to move data between phones.

## Roadmap (deliberately started simple)

1. **Cloud sync** — a shared farm database (no logins; one simple farm code) so
   multiple family members can edit from multiple devices at once and everything
   merges automatically. The data model is already sync-ready (`updatedAt` +
   soft-delete on every record).
2. Wells & gates on the pasture map; photos per animal; weaning/vaccination
   schedules; weights & sale records; reports.

## Tech

React + TypeScript + Vite, Tailwind CSS, Dexie (IndexedDB) for local storage,
`vite-plugin-pwa` for the installable/offline shell. No backend required to run.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
```

The built `dist/` is static — deploy it to any static host (Netlify, Vercel,
GitHub Pages, Cloudflare Pages). `base: './'` in `vite.config.ts` means it works
from any path.

Regenerate app icons after changing the brand mark:

```bash
npm install --no-save sharp
node scripts/gen-icons.mjs
```

## Starter herd

`public/starter-herd.csv` holds the herd transcribed from the handwritten tag
sheets. **Review it against the originals before trusting it** — see
[`docs/starter-herd-REVIEW.md`](docs/starter-herd-REVIEW.md). Load it from the
app under **More → Load starter herd**.
