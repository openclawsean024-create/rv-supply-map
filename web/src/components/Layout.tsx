import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

const IconMenu = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)
const IconClose = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

const NAV_ITEMS = [
  { to: '/', label: '地圖總覽' },
  { to: '/secret', label: '車泊秘境' },
  { to: '/campsite', label: '露營車友善營區' },
  { to: '/charge', label: '充電站' },
  { to: '/water', label: '加水站' },
  { to: '/checkin', label: '即時打卡' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const loc = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const NavList = ({ onItemClick }: { onItemClick?: () => void }) => (
    <ul className="space-y-1">
      {NAV_ITEMS.map(item => {
        const active = loc.pathname === item.to
        return (
          <li key={item.to}>
            <Link
              to={item.to}
              onClick={onItemClick}
              data-testid={`nav-${item.to.replace('/', '') || 'map'}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: active ? 'var(--bg-sidebar-active)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-primary)',
              }}
            >
              <span>{item.label}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app)' }}>
      <header
        className="sticky top-0 z-30 border-b md:hidden"
        style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-soft)' }}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            aria-label="menu"
            data-testid="mobile-menu-toggle"
          >
            <IconMenu />
          </button>
          <h1 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
            🚐 露營車供水供電地圖
          </h1>
          <div className="w-9" />
        </div>
      </header>

      <div className="md:flex md:gap-6 md:px-6 md:py-6">
        <aside className="hidden md:block w-56 flex-shrink-0">
          <div
            className="rounded-2xl p-3 sticky top-6"
            style={{ backgroundColor: 'var(--bg-sidebar)', boxShadow: 'var(--shadow-sidebar)' }}
          >
            <h2 className="font-bold text-base mb-4 px-3 py-2" style={{ color: 'var(--text-primary)' }}>
              🚐 露營車地圖
            </h2>
            <NavList />
          </div>
        </aside>

        {drawerOpen && (
          <div
            className="md:hidden fixed inset-0 z-50"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setDrawerOpen(false)}
          >
            <div
              className="w-72 h-full p-5 overflow-y-auto"
              style={{ backgroundColor: 'var(--bg-card)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>🚐 露營車地圖</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  aria-label="close"
                  data-testid="drawer-close"
                >
                  <IconClose />
                </button>
              </div>
              <NavList onItemClick={() => setDrawerOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}