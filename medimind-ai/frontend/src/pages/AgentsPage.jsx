import { useState } from 'react'
import {
  Brain, TrendingUp, ShoppingCart, Clock, ShieldCheck,
  BarChart3, Zap, Loader2, ChevronDown, ChevronUp
} from 'lucide-react'
import { agentApi } from '@/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const AGENTS = [
  { key: 'stock',      label: 'Stock Monitor',       icon: BarChart3,   color: 'amber',  api: () => agentApi.stockAnalysis(),      resKey: 'analysis',       desc: 'Analyzes current stock levels and identifies issues' },
  { key: 'demand',     label: 'Demand Forecast',     icon: TrendingUp,  color: 'blue',   api: () => agentApi.demandForecast(),     resKey: 'forecast',       desc: 'Predicts medicine demand for next 30 days' },
  { key: 'purchase',   label: 'Purchase Guide',      icon: ShoppingCart,color: 'brand',  api: () => agentApi.purchaseRecommend(),  resKey: 'recommendation', desc: 'Generates optimized purchase order recommendations' },
  { key: 'expiry',     label: 'Expiry Watch',        icon: Clock,       color: 'red',    api: () => agentApi.expiryReport(),       resKey: 'report',         desc: 'Monitors expiry dates and financial impact' },
  { key: 'compliance', label: 'Compliance Agent',    icon: ShieldCheck, color: 'purple', api: () => agentApi.complianceCheck(),    resKey: 'report',         desc: 'Checks regulatory compliance for Indian pharmacy law' },
]

const COLOR_MAP = {
  amber:  { bg: 'bg-amber-500/10',  icon: 'text-amber-500',  border: 'border-amber-500/30' },
  blue:   { bg: 'bg-blue-500/10',   icon: 'text-blue-500',   border: 'border-blue-500/30' },
  brand:  { bg: 'bg-brand-500/10',  icon: 'text-brand-500',  border: 'border-brand-500/30' },
  red:    { bg: 'bg-red-500/10',    icon: 'text-red-500',    border: 'border-red-500/30' },
  purple: { bg: 'bg-purple-500/10', icon: 'text-purple-500', border: 'border-purple-500/30' },
}

function AgentCard({ agent, result, loading, onRun, expanded, onToggle }) {
  const c = COLOR_MAP[agent.color]
  const Icon = agent.icon
  return (
    <div className={clsx('card overflow-hidden border', result ? c.border : 'border-[var(--border)]', 'transition-colors')}>
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', c.bg)}>
            {loading ? <Loader2 className={clsx('w-5 h-5 animate-spin', c.icon)} /> : <Icon className={clsx('w-5 h-5', c.icon)} />}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{agent.label}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{agent.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRun}
            disabled={loading}
            className={clsx('text-xs px-3 py-1.5 rounded-lg font-medium transition-all',
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80',
              result ? 'bg-brand-500/20 text-brand-500' : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-brand-500 hover:text-brand-500'
            )}
          >
            {loading ? 'Running…' : result ? 'Re-run' : 'Run Agent'}
          </button>
          {result && (
            <button onClick={onToggle} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      {result && expanded && (
        <div className="px-4 pb-4 border-t border-[var(--border)] pt-3">
          <pre className="text-xs whitespace-pre-wrap leading-relaxed font-sans" style={{ color: 'var(--text-secondary)' }}>
            {result}
          </pre>
        </div>
      )}
    </div>
  )
}

export default function AgentsPage() {
  const [results, setResults]   = useState({})
  const [loadings, setLoadings] = useState({})
  const [expanded, setExpanded] = useState({})
  const [councilReport, setCouncilReport] = useState(null)
  const [councilLoading, setCouncilLoading] = useState(false)
  const [councilExpanded, setCouncilExpanded] = useState(true)

  const runAgent = async (agent) => {
    setLoadings(l => ({ ...l, [agent.key]: true }))
    try {
      const { data } = await agent.api()
      setResults(r => ({ ...r, [agent.key]: data[agent.resKey] }))
      setExpanded(e => ({ ...e, [agent.key]: true }))
      toast.success(`${agent.label} completed`)
    } catch {
      toast.error(`${agent.label} failed. Check Groq API key.`)
    } finally {
      setLoadings(l => ({ ...l, [agent.key]: false }))
    }
  }

  const runCouncil = async () => {
    setCouncilLoading(true)
    try {
      const { data } = await agentApi.councilReport()
      setCouncilReport(data.council_report)
      setCouncilExpanded(true)
      // Also populate individual agents
      setResults({
        stock: data.stock_analysis,
        demand: data.demand_forecast,
        expiry: data.expiry_report,
        compliance: data.compliance_report,
        purchase: data.purchase_recommendation,
      })
      setExpanded({ stock: false, demand: false, expiry: false, compliance: false, purchase: false })
      toast.success('AI Council report ready!')
    } catch {
      toast.error('AI Council failed. Check Groq API key.')
    } finally {
      setCouncilLoading(false)
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <h1 className="section-title text-xl">Agent Council</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>6 specialized AI agents — run individually or together</p>
          </div>
        </div>
        <button
          onClick={runCouncil}
          disabled={councilLoading}
          className="btn-primary flex items-center gap-2"
        >
          {councilLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          Run Full Council
        </button>
      </div>

      {/* Council Report */}
      {(councilReport || councilLoading) && (
        <div className="card border border-brand-500/30 overflow-hidden">
          <div className="p-4 flex items-center justify-between" style={{ background: 'rgba(20,179,112,0.05)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                {councilLoading ? <Loader2 className="w-4 h-4 animate-spin text-brand-500" /> : <Brain className="w-4 h-4 text-brand-500" />}
              </div>
              <p className="font-bold font-display text-brand-500">AI Council Intelligence Report</p>
            </div>
            {councilReport && (
              <button onClick={() => setCouncilExpanded(e => !e)} className="text-[var(--text-muted)]">
                {councilExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
          {councilReport && councilExpanded && (
            <div className="p-5 border-t border-brand-500/20">
              <pre className="text-sm whitespace-pre-wrap leading-relaxed font-sans" style={{ color: 'var(--text-primary)' }}>
                {councilReport}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Individual Agents */}
      <div className="space-y-3">
        {AGENTS.map(agent => (
          <AgentCard
            key={agent.key}
            agent={agent}
            result={results[agent.key]}
            loading={loadings[agent.key]}
            expanded={expanded[agent.key]}
            onRun={() => runAgent(agent)}
            onToggle={() => setExpanded(e => ({ ...e, [agent.key]: !e[agent.key] }))}
          />
        ))}
      </div>
    </div>
  )
}
