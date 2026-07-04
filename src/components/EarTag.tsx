import type { AnimalType } from '../types'

// The animal identifier: a single-color livestock ear tag (one shape, one color)
// with the tag number shown large — a classic cattle "maxi tag" silhouette
// (domed keyhole top, angled shoulders, squared rounded body). No animal photos
// as identifiers; a photo can live inside a record instead.
//
// `type` is accepted for call-site compatibility but does not change the tag —
// the ranch uses a single tag color/shape.

const TAG = '#9c5a34' // cognac
const NUM = '#ffffff'

type Size = 'sm' | 'md' | 'lg'
const WIDTHS: Record<Size, number> = { sm: 46, md: 58, lg: 78 }

/** Font size (in viewBox units) that keeps the number readable at any length. */
function fontSize(len: number): number {
  if (len <= 2) return 40
  if (len === 3) return 32
  if (len === 4) return 25
  return 20
}

// Outer silhouette + a punched hole (evenodd) so the hole shows the background,
// giving the ring look of a real tag.
const TAG_PATH =
  // body + shoulders + domed top
  'M37 39 A15 22 0 1 1 63 39 L85 58 Q91 63 91 71 L91 96 Q91 108 79 108 ' +
  'L21 108 Q9 108 9 96 L9 71 Q9 63 15 58 Z ' +
  // punch hole
  'M42.5 26 a7.5 7.5 0 1 0 15 0 a7.5 7.5 0 1 0 -15 0 Z'

export function EarTag({
  tag,
  size = 'md',
  className = '',
}: {
  tag: string
  type?: AnimalType
  size?: Size
  className?: string
}) {
  const w = WIDTHS[size]
  return (
    <svg
      className={`shrink-0 select-none ${className}`}
      style={{ width: w, height: w * 1.14, filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.2))' }}
      viewBox="0 0 100 114"
      role="img"
      aria-label={`Tag ${tag}`}
    >
      <path d={TAG_PATH} fill={TAG} fillRule="evenodd" />
      <text
        x="50"
        y="77"
        textAnchor="middle"
        dominantBaseline="central"
        fill={NUM}
        style={{ fontFamily: '"Zilla Slab", Georgia, serif', fontWeight: 700 }}
        fontSize={fontSize(tag.length)}
      >
        {tag}
      </text>
    </svg>
  )
}
