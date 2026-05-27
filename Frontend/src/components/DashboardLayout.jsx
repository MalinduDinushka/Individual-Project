import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaMapMarkerAlt, FaBell, FaPhoneAlt, FaSignOutAlt, FaCalendarAlt } from 'react-icons/fa'
import { MdDashboard, MdExplore, MdMessage, MdFavorite, MdSettings, MdWork, MdInbox, MdAttachMoney, MdPeople, MdVerifiedUser, MdWarning, MdBarChart } from 'react-icons/md'
import { useAuthStore } from '../store/authStore'
import { useState } from 'react'
import SOSModal from './SOSModal'
import NotificationDropdown from './NotificationDropdown'

const iconMap = {
  home: MdDashboard,
  map: MdExplore,
  message: MdMessage,
  heart: MdFavorite,
  settings: MdSettings,
  briefcase: MdWork,
  package: MdWork,
  inbox: MdInbox,
  dollar: MdAttachMoney,
  users: MdPeople,
  verified: MdVerifiedUser,
  warning: MdWarning,
  chart: MdBarChart,
  calendar: FaCalendarAlt
}

const DashboardLayout = ({ children, navItems, userRole }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [showSOS, setShowSOS] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleLabels = {
    tourist: 'Traveler',
    provider: 'Provider',
    admin: 'Admin'
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-700">
      <aside className="w-72 bg-slate-950 text-white fixed h-full border-r border-white/10 shadow-[8px_0_40px_rgba(15,23,42,0.15)]">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-cyan-400 to-primary p-2 rounded-2xl shadow-lg shadow-cyan-500/20">
              <FaMapMarkerAlt className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">TourMate</h1>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/80 inline-flex mt-1">
                {roleLabels[userRole]}
              </span>
            </div>
          </Link>
        </div>

        <nav className="p-4">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon]
            const isActive = location.pathname === `/${userRole}${item.path ? '/' + item.path : ''}`

            return (
              <Link
                key={item.path}
                to={`/${userRole}${item.path ? '/' + item.path : ''}`}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl mb-2 transition border ${
                  isActive
                    ? 'bg-white text-slate-950 font-semibold border-white/10 shadow-lg'
                    : 'text-white/75 hover:bg-white/5 border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="text-xl" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-rose-500/90 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="ml-72 flex-1">
        <header className="sticky top-0 z-10 bg-white/75 backdrop-blur-xl border-b border-white/70 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex-1">
              <p className="text-sm text-slate-500">Dashboard</p>
              <h2 className="text-lg font-semibold text-slate-900">{roleLabels[userRole]} workspace</h2>
            </div>

            <div className="flex items-center space-x-4">
              <SOSModal open={showSOS} onClose={() => setShowSOS(false)} />
              {userRole === 'tourist' && (
                <button onClick={() => setShowSOS(true)} className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-red-500 text-white px-4 py-2.5 rounded-2xl hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-200">
                  <FaPhoneAlt />
                  <span className="font-medium">SOS</span>
                </button>
              )}

              <NotificationDropdown />

              <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
                <Link to={`/${userRole}/profile`}>
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'JD')}`}
                    alt={user?.name}
                    className="w-11 h-11 rounded-2xl object-cover ring-2 ring-white shadow-md"
                  />
                </Link>
                <div className="hidden md:block">
                  <div className="font-semibold text-slate-900">{user?.name?.split(' ')[0] || 'JD'}</div>
                  <div className="text-xs text-slate-500 capitalize">{userRole}</div>
                </div>
              </div>

              <button onClick={handleLogout} className="p-3 text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors" title="Logout">
                <FaSignOutAlt className="text-xl" />
              </button>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
