import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000,
})

// Attach auth token
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('medimind-auth')
  if (raw) {
    try {
      const { state } = JSON.parse(raw)
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`
    } catch (_) {}
  }
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('medimind-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    return api.post('/auth/login', form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
  },
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}

// ─── Medicines ────────────────────────────────────────────────────────────────
export const medicineApi = {
  list: (params) => api.get('/medicines/', { params }),
  get: (id) => api.get(`/medicines/${id}`),
  create: (data) => api.post('/medicines/', data),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
  kpis: () => api.get('/medicines/dashboard/kpis'),
  categories: () => api.get('/medicines/meta/categories'),
}

// ─── Agents ───────────────────────────────────────────────────────────────────
export const agentApi = {
  chat: (message, history) => api.post('/agents/copilot/chat', { message, history }),
  stockAnalysis: () => api.get('/agents/stock/analyze'),
  demandForecast: (season) => api.get('/agents/demand/forecast', { params: { season } }),
  purchaseRecommend: () => api.get('/agents/purchase/recommend'),
  expiryReport: () => api.get('/agents/expiry/report'),
  complianceCheck: () => api.get('/agents/compliance/check'),
  councilReport: () => api.get('/agents/council/report'),
}

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const alertApi = {
  list: (params) => api.get('/alerts/', { params }),
  markRead: (id) => api.patch(`/alerts/${id}/read`),
  resolve: (id) => api.patch(`/alerts/${id}/resolve`),
  markAllRead: () => api.patch('/alerts/mark-all-read'),
}
