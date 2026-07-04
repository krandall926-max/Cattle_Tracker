// Sand Creek Cattle brand mark — the ranch's actual logo (sunrise rays over the
// looping monogram), served from public/brand.png. Transparent cobalt art, so it
// sits on the white header tile as-is; pass a filter class (e.g. `invert`) to
// recolor it for dark backgrounds.
export function BrandMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}brand.png`}
      alt="Sand Creek Cattle"
      draggable={false}
      className={`object-contain ${className}`}
    />
  )
}
