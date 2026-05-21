import { Routes, Route } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import TouristDashboardHome from './TouristDashboardHome'

const TouristDashboard = () => {
  const navItems = [
    { path: '', label: 'Dashboard', icon: 'home' },
    { path: 'trips', label: 'My Trips', icon: 'map' },
    { path: 'messages', label: 'Messages', icon: 'message' },
    { path: 'saved', label: 'Saved', icon: 'heart' },
    { path: 'settings', label: 'Settings', icon: 'settings' }
  ]

  return (
    <DashboardLayout navItems={navItems} userRole="tourist">
      <Routes>
        <Route path="/" element={<TouristDashboardHome />} />
        <Route path="/trips" element={<div>My Trips - Coming Soon</div>} />
        <Route path="/messages" element={<div>Messages - Coming Soon</div>} />
        <Route path="/saved" element={<div>Saved - Coming Soon</div>} />
        <Route path="/settings" element={<div>Settings - Coming Soon</div>} />
      </Routes>
    </DashboardLayout>
  )
}

export default TouristDashboard
