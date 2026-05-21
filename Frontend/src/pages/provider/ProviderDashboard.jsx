import React from 'react'
import { Routes, Route } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import ProviderDashboardHome from './ProviderDashboardHome'
import ProviderBookings from './ProviderBookings'
import MessagesPage from '../MessagesPage'
import ProviderRequestsPage from './ProviderRequestsPage'

const ProviderDashboard = () => {
  const navItems = [
    { path: '', label: 'Dashboard', icon: 'home' },
    { path: 'services', label: 'My Services', icon: 'briefcase' },
    { path: 'requests', label: 'Requests', icon: 'inbox', badge: 2 },
    { path: 'messages', label: 'Messages', icon: 'message' },
    { path: 'bookings', label: 'Bookings', icon: 'calendar' },
    { path: 'earnings', label: 'Earnings', icon: 'dollar' },
    { path: 'settings', label: 'Settings', icon: 'settings' }
  ]

  return (
    <DashboardLayout navItems={navItems} userRole="provider">
      <Routes>
        <Route path="/" element={<ProviderDashboardHome />} />
        <Route path="/services" element={<div>My Services - Coming Soon</div>} />
        <Route path="/requests" element={<ProviderRequestsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/bookings" element={<React.Suspense fallback={<div>Loading...</div>}><ProviderBookings /></React.Suspense>} />
        <Route path="/earnings" element={<div>Earnings - Coming Soon</div>} />
        <Route path="/settings" element={<div>Settings - Coming Soon</div>} />
      </Routes>
    </DashboardLayout>
  )
}

export default ProviderDashboard
