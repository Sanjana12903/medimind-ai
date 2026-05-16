import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Eye, EyeOff, Loader2, Sun, Moon } from 'lucide-react'
import { useAuthStore, useThemeStore } from '@/store'
import { authApi } from '@/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [tab, setTab]           = useState('login')   // login | register
  const [name, setName]         = useState('')

  const { setAuth } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authApi.login(email, password)
      setAuth(data.access_token, data.user)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.register({ name, email, password })
      toast.success('Account created! Please log in.')
      setTab('login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4 relative">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 w-9 h-9 rounded-xl card flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <div className="w-full max-w-md animate-slide-up">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center shadow-xl shadow-brand-500/30 mb-4">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            MediMind AI
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Medical Inventory Intelligence Platform
          </p>
        </div>

        <div className="card p-8">
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--bg-base)' }}>
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={clsx(
                  'flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize',
                  tab === t
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <input className="input-base" placeholder="Dr. Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <input
                className="input-base"
                type="email"
                placeholder="admin@medimind.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  className="input-base pr-10"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {tab === 'login' && (
            <div className="mt-5 p-4 rounded-xl text-xs space-y-1" style={{ background: 'var(--bg-base)', color: 'var(--text-muted)' }}>
              <p className="font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Demo Credentials</p>
              <p>👑 Admin: <span className="font-mono">admin@medimind.ai</span> / <span className="font-mono">Admin@123</span></p>
              <p>💊 Pharmacist: <span className="font-mono">pharmacist@medimind.ai</span> / <span className="font-mono">Pharma@123</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
