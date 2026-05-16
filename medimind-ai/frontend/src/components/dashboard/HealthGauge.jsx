import { PieChart, Pie, Cell } from 'recharts'
import clsx from 'clsx'

export default function HealthGauge({ score = 0 }) {
  const color = score >= 80 ? '#14b370' : score >= 50 ? '#f59e0b' : '#ef4444'
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Critical'
  const data = [{ value: score }, { value: 100 - score }]

  return (
    <div className="card p-5 flex flex-col items-center gap-2 animate-fade-in">
      <p className="text-xs font-medium uppercase tracking-wider self-start" style={{ color: 'var(--text-muted)' }}>
        Inventory Health
      </p>
      <div className="relative">
        <PieChart width={140} height={80}>
          <Pie
            data={data}
            cx={65} cy={70}
            startAngle={180} endAngle={0}
            innerRadius={45} outerRadius={65}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={color} />
            <Cell fill="var(--border)" />
          </Pie>
        </PieChart>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <p className="text-2xl font-bold font-display" style={{ color }}>{score}</p>
        </div>
      </div>
      <span className={clsx(
        'text-xs font-semibold px-3 py-1 rounded-full',
        score >= 80 ? 'bg-brand-500/10 text-brand-500' :
        score >= 50 ? 'bg-amber-500/10 text-amber-500' :
                      'bg-red-500/10 text-red-500'
      )}>
        {label}
      </span>
    </div>
  )
}
