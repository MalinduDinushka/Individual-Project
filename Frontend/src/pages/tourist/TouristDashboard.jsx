import { Routes, Route } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import TouristDashboardHome from './TouristDashboardHome'
import MyBookings from './MyBookings'
import MessagesPage from '../MessagesPage'
import TourRequestCreate from './TourRequestCreate'
import TourRequestsPage from './TourRequestsPage'
import ProviderProfilePage from './ProviderProfilePage'
import ProfilePage from '../ProfilePage'
import TouristSettingsPage from './TouristSettingsPage'

const TouristDashboard = () => {
  const navItems = [
    { path: '', label: 'Dashboard', icon: 'home' },
    { path: 'profile', label: 'Profile', icon: 'users' },
    { path: 'trips', label: 'My Trips', icon: 'map' },
    { path: 'requests', label: 'Requests', icon: 'inbox' },
    { path: 'messages', label: 'Messages', icon: 'message' },
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
        <Route path="/requests/:requestId/edit" element={<TourRequestCreate />} />
        <Route path="/provider/:providerId" element={<ProviderProfilePage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/settings" element={<TouristSettingsPage />} />
      </Routes>
    </DashboardLayout>
  )
}

export default TouristDashboard
