// Sand Creek Cattle brand mark — sunrise rays over the looping monogram.
// Recreated as SVG (cobalt, no frame). The monogram is an approximation of the
// registered brand; swap in the exact art when the source file is available.
export function BrandMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#1e35d4" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* sunrise arch + rays */}
        <path d="M16 50 Q50 25 84 50" strokeWidth={8.5} />
        <path d="M50 30 L50 16" strokeWidth={7.5} />
        <path d="M39 32 L34 19" strokeWidth={7.5} />
        <path d="M61 32 L66 19" strokeWidth={7.5} />
        <path d="M28 40 L20 29" strokeWidth={7.5} />
        <path d="M72 40 L80 29" strokeWidth={7.5} />
        {/* looping monogram */}
        <path
          d="M30 91 L30 66 C30 56 45 56 45 66 L45 74 C45 58 63 56 63 72 L63 91"
          strokeWidth={9}
        />
      </g>
    </svg>
  )
}
