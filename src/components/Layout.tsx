import { NavLink, Outlet, Link } from 'react-router-dom'
import { Compass, House, ListChecks, Moon, Search, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from './ui'

function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const toggle = () => {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('sl-theme', next ? 'dark' : 'light')
    setDark(next)
    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute('content', next ? '#121418' : '#f3f0e8')
  }
  return { dark, toggle }
}

const TABS = [
  { to: '/', label: '홈', icon: House, end: true },
  { to: '/fields', label: '분야', icon: Compass, end: false },
  { to: '/search', label: '검색', icon: Search, end: false },
  { to: '/progress', label: '진행', icon: ListChecks, end: false },
]

export function Layout() {
  const { dark, toggle } = useTheme()

  useEffect(() => {
    const onResize = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div className="min-h-dvh bg-paper text-ink dark:bg-[#121418] dark:text-[#f3f0e8]">
      <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/85 backdrop-blur-md dark:border-white/10 dark:bg-[#121418]/85">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-[0.14em]">
            <img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="" className="h-8 w-8 rounded-lg" />
            SCIENCE LAB
          </Link>
          <button
            type="button"
            onClick={toggle}
            aria-label={dark ? '밝은 화면으로 전환' : '어두운 화면으로 전환'}
            className="grid h-10 w-10 place-items-center rounded-full bg-black/5 dark:bg-white/10"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-5">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur-md dark:border-white/10 dark:bg-[#121418]/95">
        <div className="mx-auto grid max-w-3xl grid-cols-4 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-medium',
                  isActive ? 'text-sea' : 'text-ink/45 dark:text-white/45',
                )
              }
            >
              <tab.icon size={20} strokeWidth={1.8} />
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
