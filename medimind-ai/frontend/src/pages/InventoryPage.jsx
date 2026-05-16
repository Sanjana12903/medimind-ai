import { useEffect, useState } from 'react'
import { Plus, Search, Filter, Pencil, Trash2, X, Loader2, Package } from 'lucide-react'
import { medicineApi } from '@/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import clsx from 'clsx'

const EMPTY_FORM = {
  name: '', generic_name: '', category: '', manufacturer: '',
  sku: '', batch_number: '', quantity: 0, unit: 'strips',
  reorder_level: 50, max_stock: 500, cost_price: 0, selling_price: 0,
  supplier: '', expiry_date: '', location: '', description: '', is_controlled: 0,
}

function MedicineModal({ medicine, onClose, onSave }) {
  const [form, setForm]     = useState(medicine ?? EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (medicine?.id) await medicineApi.update(medicine.id, form)
      else await medicineApi.create(form)
      toast.success(medicine?.id ? 'Medicine updated' : 'Medicine added')
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ label, name, type = 'text', ...props }) => (
    <div>
      <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <input className="input-base" type={type} value={form[name] ?? ''} onChange={(e) => set(name, type === 'number' ? Number(e.target.value) : e.target.value)} {...props} />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <h2 className="section-title">{medicine?.id ? 'Edit Medicine' : 'Add Medicine'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-[var(--text-muted)]" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 grid grid-cols-2 gap-4">
          <Field label="Medicine Name *" name="name" required className="col-span-2" />
          <Field label="Generic Name" name="generic_name" />
          <Field label="Category *" name="category" required />
          <Field label="SKU *" name="sku" required />
          <Field label="Batch Number" name="batch_number" />
          <Field label="Manufacturer" name="manufacturer" />
          <Field label="Supplier" name="supplier" />
          <Field label="Quantity" name="quantity" type="number" min="0" />
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Unit</label>
            <select className="input-base" value={form.unit} onChange={(e) => set('unit', e.target.value)}>
              {['strips','bottles','vials','ampoules','sachets','units'].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <Field label="Reorder Level" name="reorder_level" type="number" min="0" />
          <Field label="Max Stock" name="max_stock" type="number" min="0" />
          <Field label="Cost Price (₹)" name="cost_price" type="number" min="0" step="0.01" />
          <Field label="Selling Price (₹)" name="selling_price" type="number" min="0" step="0.01" />
          <Field label="Expiry Date" name="expiry_date" type="date" />
          <Field label="Location / Rack" name="location" />
          <div className="col-span-2">
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea className="input-base resize-none" rows={2} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div className="col-span-2 flex items-center gap-3">
            <input type="checkbox" id="ctrl" checked={form.is_controlled === 1} onChange={(e) => set('is_controlled', e.target.checked ? 1 : 0)} className="w-4 h-4 accent-brand-500" />
            <label htmlFor="ctrl" className="text-sm" style={{ color: 'var(--text-secondary)' }}>Controlled Substance (Schedule H / H1 / X)</label>
          </div>
          <div className="col-span-2 flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {medicine?.id ? 'Save Changes' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function InventoryPage() {
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [lowStock, setLowStock]   = useState(false)
  const [expiring, setExpiring]   = useState(false)
  const [modal, setModal]         = useState(null)   // null | 'add' | medicine obj
  const [categories, setCategories] = useState([])

  const load = async () => {
    setLoading(true)
    try {
      const [medsRes, catRes] = await Promise.all([
        medicineApi.list({ search: search || undefined, category: catFilter || undefined, low_stock: lowStock, expiring_soon: expiring }),
        medicineApi.categories(),
      ])
      setMedicines(medsRes.data)
      setCategories(catRes.data)
    } catch {
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search, catFilter, lowStock, expiring])

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await medicineApi.delete(id)
      toast.success('Medicine deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  const stockStatus = (m) => {
    if (m.quantity === 0) return { label: 'Out of Stock', cls: 'badge-critical' }
    if (m.quantity <= m.reorder_level) return { label: 'Low Stock', cls: 'badge-warning' }
    return { label: 'In Stock', cls: 'badge-success' }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="section-title text-2xl">Inventory</h1>
        <button onClick={() => setModal('add')} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Medicine
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input className="input-base pl-9" placeholder="Search medicines…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-base w-auto min-w-36" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={lowStock} onChange={(e) => setLowStock(e.target.checked)} className="accent-brand-500" />
          Low Stock
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={expiring} onChange={(e) => setExpiring(e.target.checked)} className="accent-brand-500" />
          Expiring Soon
        </label>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{medicines.length} results</span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]" style={{ background: 'var(--bg-base)' }}>
                {['Medicine', 'Category', 'SKU', 'Qty', 'Reorder', 'Cost ₹', 'Sell ₹', 'Expiry', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(9).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-[var(--border)] animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : medicines.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-[var(--text-muted)]">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No medicines found
                </td></tr>
              ) : medicines.map((m) => {
                const s = stockStatus(m)
                return (
                  <tr key={m.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{m.name}</p>
                        {m.generic_name && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.generic_name}</p>}
                        {m.is_controlled === 1 && <span className="badge badge-critical text-[10px] mt-0.5">Controlled</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{m.category}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{m.sku}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: m.quantity === 0 ? '#ef4444' : 'var(--text-primary)' }}>
                      {m.quantity} <span className="text-xs font-normal text-[var(--text-muted)]">{m.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{m.reorder_level}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">₹{m.cost_price}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">₹{m.selling_price}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {m.expiry_date ? format(new Date(m.expiry_date), 'dd MMM yy') : '—'}
                    </td>
                    <td className="px-4 py-3"><span className={s.cls}>{s.label}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setModal(m)} className="p-1.5 rounded-lg hover:bg-brand-500/10 text-[var(--text-muted)] hover:text-brand-500 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(m.id, m.name)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <MedicineModal
          medicine={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}
