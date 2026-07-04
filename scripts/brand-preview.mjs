import sharp from 'sharp'

const OUT = process.argv[2] || 'brand-preview.png'
const C = '#1e35d4'
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="white"/>
  <g fill="none" stroke="${C}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 50 Q50 25 84 50" stroke-width="8.5"/>
    <path d="M50 30 L50 16" stroke-width="7.5"/>
    <path d="M39 32 L34 19" stroke-width="7.5"/>
    <path d="M61 32 L66 19" stroke-width="7.5"/>
    <path d="M28 40 L20 29" stroke-width="7.5"/>
    <path d="M72 40 L80 29" stroke-width="7.5"/>
  </g>
  <path d="M30 92 L30 66 C30 56 46 56 46 66 L46 82 C46 60 64 58 64 74 L64 74 C64 82 60 86 55 86"
        fill="none" stroke="${C}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

await sharp(Buffer.from(svg)).resize(240, 240).png().toFile(OUT)
console.log('rendered', OUT)
