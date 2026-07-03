// Sand Creek Cattle mark, drawn as an ear-tag with a sunrise + brand stroke.
// A simplified, legible take on the ranch logo that stays crisp at any size.
export function BrandMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ear-tag body */}
      <path
        d="M50 12c8 0 10 6 10 10v2c14 2 24 12 24 30 0 22-16 34-34 34S16 76 16 54c0-18 10-28 24-30v-2c0-4 2-10 10-10Z"
        fill="white"
        stroke="#0f172a"
        strokeWidth={5}
      />
      <circle cx="50" cy="20" r="4.5" fill="none" stroke="#0f172a" strokeWidth={4} />
      {/* Sunrise rays */}
      <g stroke="#1e35d4" strokeWidth={5} strokeLinecap="round">
        <path d="M30 50h40" />
        <path d="M34 44l-3-5M50 42v-6M66 44l3-5" />
      </g>
      {/* Brand stroke (stylized double-loop) */}
      <path
        d="M36 74V58c0-5 8-5 8 0v6c0-6 12-6 12 0v-6c0-5 8-5 8 0v16"
        fill="none"
        stroke="#1e35d4"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
