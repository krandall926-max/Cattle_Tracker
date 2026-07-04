import type { AnimalType } from '../types'

// The animal identifier: a solid-color ear tag with the tag number shown large.
// No animal photos as identifiers — a photo can live inside a record instead.
// Colors follow common cattle ear-tag conventions (and the ranch's own tags):
//   steer = red, heifer = green, calf = yellow, bull = black, cow = cobalt.
const COLORS: Record<AnimalType, { bg: string; fg: string; hole: string }> = {
  cow: { bg: '#1e35d4', fg: '#ffffff', hole: '#c2ccfb' },
  bull: { bg: '#181b20', fg: '#ffffff', hole: '#6b7280' },
  calf: { bg: '#f4b53f', fg: '#181b20', hole: '#7c5a12' },
  heifer: { bg: '#0f9d63', fg: '#ffffff', hole: '#a7f3d0' },
  steer: { bg: '#d1382f', fg: '#ffffff', hole: '#fecaca' },
}

type Size = 'sm' | 'md' | 'lg'
const DIMS: Record<Size, { w: number; radius: number; tab: number; hole: number }> = {
  sm: { w: 46, radius: 12, tab: 7, hole: 5 },
  md: { w: 58, radius: 15, tab: 9, hole: 6 },
  lg: { w: 76, radius: 19, tab: 11, hole: 8 },
}

/** Pick a readable font size for the tag string inside the tag body. */
function fontSize(w: number, len: number): number {
  const base = w * 0.44
  if (len <= 2) return base
  if (len === 3) return base * 0.82
  if (len === 4) return base * 0.66
  return base * 0.54
}

export function EarTag({
  tag,
  type,
  size = 'md',
  className = '',
}: {
  tag: string
  type: AnimalType
  size?: Size
  className?: string
}) {
  const c = COLORS[type]
  const d = DIMS[size]
  const bodyH = d.w
  return (
    <div
      className={`shrink-0 select-none ${className}`}
      style={{ width: d.w }}
      title={`Tag ${tag}`}
      aria-label={`Tag ${tag}`}
    >
      {/* Tab with punch hole */}
      <div
        className="mx-auto flex items-center justify-center"
        style={{
          width: d.w * 0.42,
          height: d.tab * 2,
          background: c.bg,
          borderTopLeftRadius: d.tab,
          borderTopRightRadius: d.tab,
          marginBottom: -d.tab,
        }}
      >
        <span
          style={{
            width: d.hole,
            height: d.hole,
            borderRadius: '9999px',
            background: c.hole,
            marginTop: -d.tab,
          }}
        />
      </div>
      {/* Body with the tag number */}
      <div
        className="flex items-center justify-center font-display font-bold leading-none"
        style={{
          width: d.w,
          height: bodyH,
          background: c.bg,
          color: c.fg,
          borderRadius: d.radius,
          fontSize: fontSize(d.w, tag.length),
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          padding: 2,
        }}
      >
        <span className="truncate px-1">{tag}</span>
      </div>
    </div>
  )
}
