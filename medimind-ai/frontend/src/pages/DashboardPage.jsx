import { useEffect, useState } from 'react'
import {
  Package, AlertTriangle, Clock, TrendingUp, DollarSign,
  ShieldAlert, RefreshCw, Boxes
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { medicineApi } from '@/api'
import KpiCard from '@/components/dashboard/KpiCard'
import HealthGauge from '@/components/dashboard/HealthGauge'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const PIE_COLORS = ['#14b370','#38ce8c','#72e3af','#0a9259','#09744a','#aaf0cd']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-xs">
      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [kpis, setKpis]       = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await medicineApi.kpis()
      setKpis(data)
    } catch {
      toast.error('Failed to load KPIs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-2xl">Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {format(new Date(), "EEEE, dd MMMM yyyy")}
          </p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="Total Medicines"
          value={kpis?.total_medicines}
          icon={Package}
          color="brand"
          subtitle="Active SKUs in inventory"
          loading={loading}
        />
        <KpiCard
          title="Low Stock"
          value={kpis?.low_stock_count}
          icon={AlertTriangle}
          color="amber"
          subtitle={`${kpis?.critical_count ?? 0} out of stock`}
          loading={loading}
        />
        <KpiCard
          title="Expiring ≤30 Days"
          value={kpis?.expiring_30_days}
          icon={Clock}
          color="red"
          subtitle={`${kpis?.expiring_90_days ?? 0} within 90 days`}
          loading={loading}
        />
        <KpiCard
          title="Unread Alerts"
          value={kpis?.unread_alerts}
          icon={ShieldAlert}
          color="red"
          subtitle="Requires attention"
          loading={loading}
        />
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="Stock Cost Value"
          value={kpis ? `₹${kpis.total_stock_value.toLocaleString('en-IN')}` : null}
          icon={DollarSign}
          color="blue"
          subtitle="At purchase price"
          loading={loading}
        />
        <KpiCard
          title="Retail Value"
          value={kpis ? `₹${kpis.total_selling_value.toLocaleString('en-IN')}` : null}
          icon={TrendingUp}
          color="brand"
          subtitle="At selling price"
          loading={loading}
        />
        <KpiCard
          title="Potential Profit"
          value={kpis ? `₹${kpis.potential_profit.toLocaleString('en-IN')}` : null}
          icon={Boxes}
          color="purple"
          subtitle="If all stock sold"
          loading={loading}
        />
        <KpiCard
          title="Expired Stock"
          value={kpis?.expired_count}
          icon={AlertTriangle}
          color={kpis?.expired_count > 0 ? 'red' : 'brand'}
          subtitle="Needs immediate disposal"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category pie */}
        <div className="card p-5">
          <p className="section-title text-base mb-4">By Category</p>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-[var(--text-muted)] text-sm">Loading…</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={kpis?.categories}
                  cx="50%" cy="50%"
                  outerRadius={70}
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={10}
                >
                  {kpis?.categories?.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Low stock bar */}
        <div className="card p-5 md:col-span-2">
          <p className="section-title text-base mb-4">Low Stock Items</p>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-[var(--text-muted)] text-sm">Loading…</div>
          ) : kpis?.low_stock_items?.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-brand-500 font-medium">✅ All medicines adequately stocked</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={kpis?.low_stock_items} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="quantity" name="Current" fill="#ef4444" radius={[0, 4, 4, 0]} />
                <Bar dataKey="reorder_level" name="Reorder At" fill="#14b370" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HealthGauge score={kpis?.health_score ?? 0} />

        {/* Expiring soon table */}
        <div className="card p-5 md:col-span-2">
          <p className="section-title text-base mb-4">Expiring Within 30 Days</p>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-8 rounded-lg bg-[var(--border)] animate-pulse" />)}
            </div>
          ) : kpis?.expiring_soon_items?.length === 0 ? (
            <div className="flex items-center justify-center h-24">
              <p className="text-sm text-brand-500 font-medium">✅ No medicines expiring soon</p>
            </div>
          ) : (
            <div className="space-y-2">
              {kpis.expiring_soon_items.map((item) => {
                const days = Math.ceil((new Date(item.expiry_date) - new Date()) / 86400000)
                return (
                  <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--bg-base)' }}>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span style={{ color: 'var(--text-muted)' }}>Qty: {item.quantity}</span>
                      <span className={`badge ${days <= 7 ? 'badge-critical' : 'badge-warning'}`}>
                        {days}d left
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
