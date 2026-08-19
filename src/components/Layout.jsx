import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useDarkMode } from '../hooks/useDarkMode'
import {
  HomeIcon,
  HandCoinsIcon,
  TagIcon,
  ChartBarIcon,
  SunIcon,
  MoonIcon,
  LogOutIcon,
} from './icons'

const navItems = [
  { to: '/', label: 'Início', icon: HomeIcon, end: true },
  { to: '/devo-a-mim', label: 'Devo a mim', icon: HandCoinsIcon },
  { to: '/relatorios', label: 'Relatórios', icon: ChartBarIcon },
  { to: '/categorias', label: 'Categorias', icon: TagIcon },
]

export function Layout() {
  const { signOut } = useAuth()
  const [dark, setDark] = useDarkMode()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Finan</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDark((d) => !d)}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Alternar tema"
          >
            {dark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => signOut()}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Sair"
          >
            <LogOutIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main
        className="mx-auto w-full max-w-2xl flex-1 px-4 pt-4"
        style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
      >
        <Outlet />
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex max-w-2xl justify-between px-2">
          {navItems.map(({ to, label, icon: IconEl, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`
              }
            >
              <IconEl className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
