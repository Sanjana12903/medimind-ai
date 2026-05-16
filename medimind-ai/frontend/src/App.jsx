import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useThemeStore, useAuthStore } from '@/store'
import Layout from '@/components/layout/Layout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import InventoryPage from '@/pages/InventoryPage'
import AlertsPage from '@/pages/AlertsPage'
import CopilotPage from '@/pages/CopilotPage'
import AgentsPage from '@/pages/AgentsPage'

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { initTheme } = useThemeStore()
  useEffect(() => { initTheme() }, [initTheme])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="copilot" element={<CopilotPage />} />
        <Route path="agents" element={<AgentsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
