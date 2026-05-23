import { Routes, Route } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import TouristDashboardHome from './TouristDashboardHome'
import MyBookings from './MyBookings'
import MessagesPage from '../MessagesPage'
import TourRequestCreate from './TourRequestCreate'
import TourRequestsPage from './TourRequestsPage'
import ProviderProfilePage from './ProviderProfilePage'
import ProfilePage from '../ProfilePage'

const TouristDashboard = () => {
  const navItems = [
    { path: '', label: 'Dashboard', icon: 'home' },
    { path: 'profile', label: 'Profile', icon: 'users' },
    { path: 'trips', label: 'My Trips', icon: 'map' },
    { path: 'requests', label: 'Requests', icon: 'inbox' },
    { path: 'messages', label: 'Messages', icon: 'message' },
    { path: 'saved', label: 'Saved', icon: 'heart' },
    { path: 'settings', label: 'Settings', icon: 'settings' }
  ]

  return (
    <DashboardLayout navItems={navItems} userRole="tourist">
      <Routes>
        <Route path="/" element={<TouristDashboardHome />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/trips" element={<MyBookings />} />
        <Route path="/requests" element={<TourRequestsPage />} />
        <Route path="/requests/new" element={<TourRequestCreate />} />
        <Route path="/provider/:providerId" element={<ProviderProfilePage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/saved" element={<div>Saved - Coming Soon</div>} />
        <Route path="/settings" element={<div>Settings - Coming Soon</div>} />
      </Routes>
    </DashboardLayout>
  )
}

export default TouristDashboard
