import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { BrandMark } from './Brand'
import {
  HomeIcon,
  HerdIcon,
  BreedingIcon,
  PastureIcon,
  SettingsIcon,
} from './Icons'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

const NAV = [
  { to: '/', label: 'Home', Icon: HomeIcon, end: true },
  { to: '/herd', label: 'Herd', Icon: HerdIcon, end: false },
  { to: '/breeding', label: 'Breeding', Icon: BreedingIcon, end: false },
  { to: '/pastures', label: 'Pastures', Icon: PastureIcon, end: false },
  { to: '/settings', label: 'More', Icon: SettingsIcon, end: false },
]

export function Layout({ children }: { children: ReactNode }) {
  const online = useOnlineStatus()
  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-cobalt-600 px-4 py-3 text-white shadow-md">
        <BrandMark className="h-9 w-9" />
        <div className="leading-tight">
          <div className="text-base font-bold tracking-wide">SAND CREEK</div>
          <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-cobalt-100">
            Cattle
          </div>
        </div>
        <span
          className={`ml-auto chip ${online ? 'bg-cobalt-500 text-white' : 'bg-amber-400 text-slate-900'}`}
          title={online ? 'Online — changes are saved on this device' : 'Offline — still fully working; changes save on this device'}
        >
          <span className={`h-2 w-2 rounded-full ${online ? 'bg-emerald-300' : 'bg-slate-900'}`} />
          {online ? 'Online' : 'Offline'}
        </span>
      </header>

      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-2xl justify-around border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        {NAV.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                isActive ? 'text-cobalt-600' : 'text-slate-400'
              }`
            }
          >
            <Icon className="h-6 w-6" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
