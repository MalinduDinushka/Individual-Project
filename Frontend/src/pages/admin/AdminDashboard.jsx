import { Routes, Route } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import AdminDashboardHome from './AdminDashboardHome'
import AdminUsersPage from './AdminUsersPage'
import AdminSOSPage from './AdminSOSPage'

const AdminDashboard = () => {
  const navItems = [
    { path: '', label: 'Overview', icon: 'home' },
    { path: 'users', label: 'User Management', icon: 'users' },
    { path: 'verifications', label: 'Verifications', icon: 'verified', badge: 4 },
    { path: 'sos', label: 'SOS Alerts', icon: 'warning', badge: 2 },
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
