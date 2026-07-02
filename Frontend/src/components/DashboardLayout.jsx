import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaPhoneAlt, FaSignOutAlt, FaCalendarAlt, FaBars, FaTimes } from 'react-icons/fa'
import { MdDashboard, MdExplore, MdMessage, MdFavorite, MdSettings, MdWork, MdInbox, MdAttachMoney, MdPeople, MdVerifiedUser, MdWarning, MdBarChart } from 'react-icons/md'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { useState } from 'react'
import Logo from './Logo'
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
  const theme = useThemeStore(state => state.theme)
  const [showSOS, setShowSOS] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isDark = theme === 'dark'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const roleLabels = {
    tourist: 'Traveler',
    provider: 'Provider',
    admin: 'Admin'
  }

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-700'}`}>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className={`fixed inset-0 z-30 lg:hidden ${isDark ? 'bg-slate-950/60' : 'bg-slate-950/45'}`}
        />
      )}

      <aside className={`w-72 fixed inset-y-0 left-0 z-40 border-r shadow-[8px_0_40px_rgba(15,23,42,0.15)] transition-transform duration-200 lg:translate-x-0 ${isDark ? 'bg-slate-950 text-white border-white/10' : 'bg-white text-slate-800 border-slate-200 shadow-[8px_0_40px_rgba(15,23,42,0.06)]'} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className={`p-6 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Logo
                to="/"
                className="flex-1"
                textClassName={isDark ? 'text-white' : 'text-slate-900'}
                iconContainerClassName={isDark ? 'bg-white/10' : 'bg-slate-100'}
              />
              <span className={`text-xs px-2.5 py-1 rounded-full inline-flex mt-1 ${isDark ? 'bg-white/10 text-white/80' : 'bg-slate-100 text-slate-600'}`}>
                {roleLabels[userRole]}
              </span>
            </div>
            <button type="button" onClick={() => setSidebarOpen(false)} className={`p-2 rounded-lg lg:hidden ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`} aria-label="Close sidebar">
              <FaTimes />
            </button>
          </div>
        </div>

        <nav className="p-4">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon]
            const isActive = location.pathname === `/${userRole}${item.path ? '/' + item.path : ''}`

            return (
              <Link
                key={item.path}
                to={`/${userRole}${item.path ? '/' + item.path : ''}`}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg mb-2 transition border ${
                  isActive
                    ? isDark
                      ? 'bg-white text-slate-950 font-semibold border-white/10 shadow-lg'
                      : 'bg-slate-900 text-white font-semibold border-slate-200 shadow-sm'
                    : isDark
                      ? 'text-white/75 hover:bg-white/5 border-transparent'
                      : 'text-slate-600 hover:bg-slate-100 border-transparent'
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

      <div className="lg:ml-72 flex-1 min-w-0">
        <header className={`sticky top-0 z-10 backdrop-blur-xl border-b ${isDark ? 'bg-slate-950/75 border-white/10 shadow-[0_10px_30px_rgba(15,23,42,0.22)]' : 'bg-white/80 border-slate-200/80 shadow-[0_10px_30px_rgba(15,23,42,0.05)]'}`}>
          <div className="flex items-center justify-between gap-4 px-4 md:px-8 py-4">
            <button type="button" onClick={() => setSidebarOpen(true)} className={`p-3 rounded-lg lg:hidden ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`} aria-label="Open sidebar">
              <FaBars className={isDark ? 'text-slate-200' : 'text-slate-700'} />
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Dashboard</p>
              <h2 className={`text-lg font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{roleLabels[userRole]} workspace</h2>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              {userRole === 'tourist' && (
                <button type="button" onClick={() => setShowSOS(true)} className="flex items-center space-x-2 bg-gradient-to-r from-rose-600 to-red-600 text-white px-3 md:px-4 py-2.5 rounded-lg font-bold shadow-md shadow-rose-500/20 ring-2 ring-rose-100 hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-200">
                  <FaPhoneAlt />
                  <span className="hidden sm:inline">Emergency SOS</span>
                  <span className="sm:hidden">SOS</span>
                </button>
              )}

              <NotificationDropdown />

              <div className={`flex items-center space-x-3 border-l pl-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <Link to={`/${userRole}/profile`}>
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'JD')}`}
                    alt={user?.name}
                    className={`w-11 h-11 rounded-lg object-cover ring-2 shadow-md ${isDark ? 'ring-slate-900' : 'ring-white'}`}
                  />
                </Link>
                <div className="hidden md:block">
                  <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name?.split(' ')[0] || 'JD'}</div>
                  <div className={`text-xs capitalize ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{userRole}</div>
                </div>
              </div>

              <button onClick={handleLogout} className={`p-3 rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`} title="Logout">
                <FaSignOutAlt className="text-xl" />
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 lg:p-10">
          {children}
        </main>
        <SOSModal open={showSOS} onClose={() => setShowSOS(false)} />
      </div>
    </div>
  )
}

export default DashboardLayout
