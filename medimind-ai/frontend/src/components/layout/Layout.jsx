import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Bell, Bot, Brain, LogOut,
  Sun, Moon, Menu, X, Activity, ChevronRight
} from 'lucide-react'
import { useThemeStore, useAuthStore } from '@/store'
import clsx from 'clsx'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventory',  icon: Package,         label: 'Inventory' },
  { to: '/alerts',     icon: Bell,            label: 'Alerts' },
  { to: '/copilot',    icon: Bot,             label: 'AI Copilot' },
  { to: '/agents',     icon: Brain,           label: 'Agent Council' },
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useThemeStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={clsx('flex items-center gap-3 px-4 py-5 border-b', 'border-[var(--border)]')}>
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/30">
          <Activity className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-display font-bold text-base leading-none" style={{ color: 'var(--text-primary)' }}>
              MediMind
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>AI Platform</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative',
                isActive
                  ? 'bg-brand-500/10 text-brand-500'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-500 rounded-r-full" />
                )}
                <Icon className={clsx('w-4.5 h-4.5 flex-shrink-0', isActive ? 'text-brand-500' : '')} />
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="px-3 py-4 border-t border-[var(--border)] space-y-2">
        <button
          onClick={toggleTheme}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
            'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
          )}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* User */}
        <div className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-xl', 'bg-[var(--bg-card-hover)]')}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.role}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} className="text-[var(--text-muted)] hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Desktop Sidebar */}
      <aside
        className={clsx(
          'hidden md:flex flex-col flex-shrink-0 transition-all duration-300 border-r border-[var(--border)]',
          'bg-[var(--bg-card)]',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-full z-10 w-5 h-10 bg-[var(--bg-card)] border border-[var(--border)] rounded-r-lg flex items-center justify-center text-[var(--text-muted)] hover:text-brand-500 transition-colors"
          style={{ marginLeft: collapsed ? '4rem' : '15rem' }}
        >
          <ChevronRight className={clsx('w-3 h-3 transition-transform', collapsed ? '' : 'rotate-180')} />
        </button>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[var(--bg-card)] border-r border-[var(--border)] z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-card)]">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>MediMind</span>
          </div>
          <button onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} /> : <Moon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
