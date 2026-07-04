// One-off: rasterize the brand mark into the PNG app icons the PWA needs.
// Run with: node scripts/gen-icons.mjs
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'

mkdirSync('public/icons', { recursive: true })

const C = '#1e35d4'

// The brand mark paths (kept in sync with src/components/Brand.tsx).
const mark = `
  <g stroke="${C}" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M16 50 Q50 25 84 50" stroke-width="8.5"/>
    <path d="M50 30 L50 16" stroke-width="7.5"/>
    <path d="M39 32 L34 19" stroke-width="7.5"/>
    <path d="M61 32 L66 19" stroke-width="7.5"/>
    <path d="M28 40 L20 29" stroke-width="7.5"/>
    <path d="M72 40 L80 29" stroke-width="7.5"/>
    <path d="M30 91 L30 66 C30 56 45 56 45 66 L45 74 C45 58 63 56 63 72 L63 91" stroke-width="9"/>
  </g>`

// App icon: cobalt brand on a white tile (matches the header badge).
const icon = (rounded) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="${rounded}" fill="#ffffff"/>
  <g transform="translate(10,10) scale(0.8)">${mark}</g>
</svg>`

// Maskable: white full-bleed, brand centered inside the safe zone.
const maskable = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#ffffff"/>
  <g transform="translate(22,22) scale(0.56)">${mark}</g>
</svg>`

const jobs = [
  ['public/icons/icon-192.png', icon(18), 192],
  ['public/icons/icon-512.png', icon(48), 512],
  ['public/icons/apple-touch-icon.png', icon(0), 180],
  ['public/icons/icon-512-maskable.png', maskable, 512],
]
for (const [out, svg, size] of jobs) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out)
  console.log('wrote', out)
}

// Favicon (SVG, crisp): brand on white rounded tile.
writeFileSync('public/favicon.svg', icon(18).trim() + '\n')
console.log('wrote public/favicon.svg')
