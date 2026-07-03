// One-off: rasterize the brand SVG into the PNG app icons the PWA manifest needs.
// Run with: node scripts/gen-icons.mjs
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

mkdirSync('public/icons', { recursive: true })

// Plain icon (used for 192/512 and apple-touch): rounded cobalt tile + ear tag.
const icon = (size, pad = 0) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  <rect width="100" height="100" rx="20" fill="#1e35d4"/>
  <g transform="translate(${pad},${pad}) scale(${(100 - pad * 2) / 100})">
    <path d="M50 16c7 0 9 5 9 9v2c12 2 21 11 21 27 0 19-14 30-30 30S20 73 20 54c0-16 9-25 21-27v-2c0-4 2-9 9-9Z" fill="#ffffff" stroke="#0f172a" stroke-width="4"/>
    <circle cx="50" cy="23" r="4" fill="none" stroke="#0f172a" stroke-width="3.5"/>
    <g stroke="#1e35d4" stroke-width="4.5" stroke-linecap="round">
      <path d="M32 50h36"/><path d="M36 44l-3-4M50 42v-5M64 44l3-4"/>
    </g>
    <path d="M37 72V58c0-4.5 7-4.5 7 0v5c0-5.5 12-5.5 12 0v-5c0-4.5 7-4.5 7 0v14" fill="none" stroke="#1e35d4" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`

// Maskable icon: same art but with safe-zone padding so launchers can crop it.
const maskable = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <rect width="100" height="100" fill="#1e35d4"/>
  <g transform="translate(18,18) scale(0.64)">
    <path d="M50 16c7 0 9 5 9 9v2c12 2 21 11 21 27 0 19-14 30-30 30S20 73 20 54c0-16 9-25 21-27v-2c0-4 2-9 9-9Z" fill="#ffffff" stroke="#0f172a" stroke-width="4"/>
    <circle cx="50" cy="23" r="4" fill="none" stroke="#0f172a" stroke-width="3.5"/>
    <g stroke="#1e35d4" stroke-width="4.5" stroke-linecap="round">
      <path d="M32 50h36"/><path d="M36 44l-3-4M50 42v-5M64 44l3-4"/>
    </g>
    <path d="M37 72V58c0-4.5 7-4.5 7 0v5c0-5.5 12-5.5 12 0v-5c0-4.5 7-4.5 7 0v14" fill="none" stroke="#1e35d4" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`

const jobs = [
  ['public/icons/icon-192.png', icon(192), 192],
  ['public/icons/icon-512.png', icon(512), 512],
  ['public/icons/apple-touch-icon.png', icon(180), 180],
  ['public/icons/icon-512-maskable.png', maskable, 512],
]

for (const [out, svg, size] of jobs) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out)
  console.log('wrote', out)
}
