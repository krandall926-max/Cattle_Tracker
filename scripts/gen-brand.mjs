// Generate all brand assets from the real logo PNG.
// Usage: node scripts/gen-brand.mjs <source.png>
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const src = process.argv[2]
if (!src) throw new Error('pass the source logo path')
mkdirSync('public/icons', { recursive: true })

// Tight-crop the transparent border so the mark fills its box.
const trimmed = await sharp(src).trim().png().toBuffer()

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 }
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 }

// A square tile with the mark centered at `contentFrac` of the size.
async function tile(size, contentFrac, bg) {
  const content = Math.round(size * contentFrac)
  const brand = await sharp(trimmed)
    .resize(content, content, { fit: 'contain', background: TRANSPARENT })
    .toBuffer()
  return sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: brand, gravity: 'center' }])
    .png()
    .toBuffer()
}

async function write(path, buf) {
  await sharp(buf).toFile(path)
  console.log('wrote', path)
}

// Transparent master used in-app (header tile, watermark, empty states).
await write(
  'public/brand.png',
  await sharp(trimmed).resize(512, 512, { fit: 'contain', background: TRANSPARENT }).png().toBuffer(),
)

// App icons: cobalt mark on a white tile.
await write('public/icons/icon-192.png', await tile(192, 0.78, WHITE))
await write('public/icons/icon-512.png', await tile(512, 0.78, WHITE))
await write('public/icons/apple-touch-icon.png', await tile(180, 0.78, WHITE))
await write('public/icons/icon-512-maskable.png', await tile(512, 0.58, WHITE))
await write('public/favicon.png', await tile(48, 0.84, WHITE))
