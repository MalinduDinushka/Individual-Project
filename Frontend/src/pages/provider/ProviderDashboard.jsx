import { Routes, Route } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import ProviderDashboardHome from './ProviderDashboardHome'

const ProviderDashboard = () => {
  const navItems = [
    { path: '', label: 'Dashboard', icon: 'home' },
    { path: 'services', label: 'My Services', icon: 'briefcase' },
    { path: 'requests', label: 'Requests', icon: 'inbox', badge: 2 },
    { path: 'earnings', label: 'Earnings', icon: 'dollar' },
    { path: 'settings', label: 'Settings', icon: 'settings' }
  ]

  return (
    <DashboardLayout navItems={navItems} userRole="provider">
      <Routes>
        <Route path="/" element={<ProviderDashboardHome />} />
        <Route path="/services" element={<div>My Services - Coming Soon</div>} />
        <Route path="/requests" element={<div>Requests - Coming Soon</div>} />
        <Route path="/earnings" element={<div>Earnings - Coming Soon</div>} />
        <Route path="/settings" element={<div>Settings - Coming Soon</div>} />
      </Routes>
    </DashboardLayout>
  )
}

export default ProviderDashboard
