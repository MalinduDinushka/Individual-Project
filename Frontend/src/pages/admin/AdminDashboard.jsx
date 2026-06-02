import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import AdminDashboardHome from './AdminDashboardHome'
import AdminUsersPage from './AdminUsersPage'
import AdminSOSPage from './AdminSOSPage'
import { adminAPI } from '../../api'
import { useAuthStore } from '../../store/authStore'
import { connectSocket } from '../../utils/socket'

const AdminDashboard = () => {
  const token = useAuthStore((state) => state.token)
  const [activeSOSCount, setActiveSOSCount] = useState(0)

  const refreshSOSCount = async () => {
    try {
      const response = await adminAPI.getSOSAlerts()
      const alerts = response.data?.data || []
      setActiveSOSCount(alerts.filter((alert) => ['active', 'in-progress'].includes(alert.status)).length)
    } catch (error) {
      console.error('Failed to load active SOS count', error)
    }
  }

  useEffect(() => {
    refreshSOSCount()
  }, [])

  useEffect(() => {
    if (!token) return

    const socket = connectSocket(token)
    const handleNewSOS = () => refreshSOSCount()
    const handleSOSUpdate = ({ sos }) => {
      if (!sos) {
        refreshSOSCount()
        return
      }

      refreshSOSCount()
    }

    socket.on('sos:new', handleNewSOS)
    socket.on('sos:update', handleSOSUpdate)

    return () => {
      socket.off('sos:new', handleNewSOS)
      socket.off('sos:update', handleSOSUpdate)
    }
  }, [token])

  const navItems = [
    { path: '', label: 'Overview', icon: 'home' },
    { path: 'users', label: 'User Management', icon: 'users' },
    { path: 'verifications', label: 'Verifications', icon: 'verified', badge: 4 },
    { path: 'sos', label: 'SOS Alerts', icon: 'warning', badge: activeSOSCount || undefined },
    { path: 'reports', label: 'Reports', icon: 'chart' }
  ]

  return (
    <DashboardLayout navItems={navItems} userRole="admin">
      <Routes>
        <Route path="/" element={<AdminDashboardHome />} />
        <Route path="/users" element={<AdminUsersPage />} />
        <Route path="/verifications" element={<div>Verifications - Coming Soon</div>} />
        <Route path="/sos" element={<AdminSOSPage />} />
        <Route path="/reports" element={<div>Reports - Coming Soon</div>} />
      </Routes>
    </DashboardLayout>
  )
}

export default AdminDashboard
