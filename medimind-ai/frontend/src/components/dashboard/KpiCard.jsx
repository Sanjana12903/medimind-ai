import clsx from 'clsx'

export default function KpiCard({ title, value, subtitle, icon: Icon, trend, color = 'brand', loading }) {
  const colors = {
    brand:  { bg: 'bg-brand-500/10',  icon: 'text-brand-500',  val: 'text-brand-600 dark:text-brand-400' },
    red:    { bg: 'bg-red-500/10',    icon: 'text-red-500',    val: 'text-red-600 dark:text-red-400' },
    amber:  { bg: 'bg-amber-500/10',  icon: 'text-amber-500',  val: 'text-amber-600 dark:text-amber-400' },
    blue:   { bg: 'bg-blue-500/10',   icon: 'text-blue-500',   val: 'text-blue-600 dark:text-blue-400' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-500', val: 'text-purple-600 dark:text-purple-400' },
  }
  const c = colors[color] || colors.brand

  return (
    <div className="card p-5 flex flex-col gap-3 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-24 mt-2 rounded-lg bg-[var(--border)] animate-pulse" />
          ) : (
            <p className={clsx('text-2xl font-bold mt-1 font-display', c.val)}>{value ?? '—'}</p>
          )}
        </div>
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', c.bg)}>
          <Icon className={clsx('w-5 h-5', c.icon)} />
        </div>
      </div>
      {subtitle && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
      )}
      {trend !== undefined && (
        <div className={clsx(
          'text-xs font-medium',
          trend > 0 ? 'text-brand-500' : trend < 0 ? 'text-red-500' : 'text-[var(--text-muted)]'
        )}>
          {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}% vs last week
        </div>
      )}
    </div>
  )
}
