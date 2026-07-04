import type { AnimalType } from '../types'

// The animal identifier: a single-color livestock ear tag (one shape, one color)
// with the tag number shown large — modeled on a real cattle button/panel tag
// and the shape in the Sand Creek brand mark. No animal photos as identifiers;
// a photo can live inside a record instead.
//
// `type` is accepted for call-site compatibility but no longer changes color —
// the ranch uses a single tag color.

const TAG = '#1e35d4' // cobalt (brand)
const NUM = '#ffffff'
const HOLE = '#9aabf7'

type Size = 'sm' | 'md' | 'lg'
const WIDTHS: Record<Size, number> = { sm: 46, md: 58, lg: 78 }

/** Font size (in viewBox units) that keeps the number readable at any length. */
function fontSize(len: number): number {
  if (len <= 2) return 40
  if (len === 3) return 32
  if (len === 4) return 25
  return 20
}

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
      {/* Top tab */}
      <path d="M40 12 Q40 7 46 7 L54 7 Q60 7 60 12 L60 30 L40 30 Z" fill={TAG} />
      {/* Punch hole */}
      <circle cx="50" cy="16" r="3.4" fill={HOLE} />
      {/* Tag body — rounded cattle-tag silhouette, slightly tapered to a soft point */}
      <path
        d="M18 40 Q18 27 32 26 L68 26 Q82 27 82 40 L82 74
           Q82 90 66 99 Q54 106 50 107 Q46 106 34 99 Q18 90 18 74 Z"
        fill={TAG}
      />
      <text
        x="50"
        y="65"
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
