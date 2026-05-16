import { useEffect, useState } from 'react'
import { Bell, Check, CheckCheck, AlertTriangle, Clock, ShieldAlert, TrendingUp } from 'lucide-react'
import { alertApi } from '@/api'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

const TYPE_ICONS = {
  low_stock:    { icon: AlertTriangle, color: 'text-amber-500' },
  expiry:       { icon: Clock,         color: 'text-red-500' },
  demand_spike: { icon: TrendingUp,    color: 'text-blue-500' },
  compliance:   { icon: ShieldAlert,   color: 'text-purple-500' },
}

export default function AlertsPage() {
  const [alerts, setAlerts]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [unreadOnly, setUnreadOnly] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await alertApi.list({ unread_only: unreadOnly, limit: 100 })
      setAlerts(data)
    } catch {
      toast.error('Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [unreadOnly])

  const handleRead = async (id) => {
    await alertApi.markRead(id)
    setAlerts(a => a.map(x => x.id === id ? { ...x, is_read: 1 } : x))
  }

  const handleResolve = async (id) => {
    await alertApi.resolve(id)
    toast.success('Alert resolved')
    load()
  }

  const handleMarkAllRead = async () => {
    await alertApi.markAllRead()
    toast.success('All alerts marked as read')
    load()
  }

  const unread = alerts.filter(a => !a.is_read).length

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="section-title text-2xl">Alerts</h1>
          {unread > 0 && <span className="badge badge-critical">{unread} unread</span>}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} className="accent-brand-500" />
            Unread only
          </label>
          <button onClick={handleMarkAllRead} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="card p-4 flex gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-[var(--border)]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[var(--border)] rounded w-1/3" />
                <div className="h-3 bg-[var(--border)] rounded w-2/3" />
              </div>
            </div>
          ))
        ) : alerts.length === 0 ? (
          <div className="card p-12 flex flex-col items-center gap-3">
            <Bell className="w-10 h-10 text-brand-500 opacity-50" />
            <p className="text-[var(--text-muted)] text-sm">No alerts found</p>
          </div>
        ) : alerts.map((alert) => {
          const typeInfo = TYPE_ICONS[alert.alert_type] || TYPE_ICONS.low_stock
          const Icon = typeInfo.icon
          return (
            <div
              key={alert.id}
              className={clsx(
                'card p-4 flex items-start gap-4 transition-all',
                !alert.is_read && 'border-l-4',
                !alert.is_read && alert.severity === 'critical' && 'border-l-red-500',
                !alert.is_read && alert.severity === 'warning' && 'border-l-amber-500',
                !alert.is_read && alert.severity === 'info' && 'border-l-blue-500',
              )}
            >
              <div className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                alert.severity === 'critical' ? 'bg-red-500/10' :
                alert.severity === 'warning'  ? 'bg-amber-500/10' : 'bg-blue-500/10',
              )}>
                <Icon className={clsx('w-5 h-5', typeInfo.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{alert.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{alert.message}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={clsx(
                      'badge',
                      alert.severity === 'critical' ? 'badge-critical' :
                      alert.severity === 'warning'  ? 'badge-warning' : 'badge-info'
                    )}>
                      {alert.severity}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  {!alert.is_read && (
                    <button onClick={() => handleRead(alert.id)} className="text-xs text-brand-500 hover:underline flex items-center gap-1">
                      <Check className="w-3 h-3" /> Mark read
                    </button>
                  )}
                  {!alert.is_resolved && (
                    <button onClick={() => handleResolve(alert.id)} className="text-xs text-[var(--text-muted)] hover:text-brand-500 hover:underline flex items-center gap-1">
                      <CheckCheck className="w-3 h-3" /> Resolve
                    </button>
                  )}
                  {alert.is_resolved === 1 && (
                    <span className="text-xs text-brand-500 flex items-center gap-1"><CheckCheck className="w-3 h-3" /> Resolved</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
