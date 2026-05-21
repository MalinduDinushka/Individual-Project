import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaMapMarkerAlt, FaBell, FaPhoneAlt, FaSignOutAlt, FaCalendarAlt } from 'react-icons/fa'
import { MdDashboard, MdExplore, MdMessage, MdFavorite, MdSettings, MdWork, MdInbox, MdAttachMoney, MdPeople, MdVerifiedUser, MdWarning, MdBarChart } from 'react-icons/md'
import { useAuthStore } from '../store/authStore'

const iconMap = {
  home: MdDashboard,
  map: MdExplore,
  message: MdMessage,
  heart: MdFavorite,
  settings: MdSettings,
  briefcase: MdWork,
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleColors = {
    tourist: 'primary',
    provider: 'secondary',
    admin: 'red-600'
  }

  const roleLabels = {
    tourist: '',
    provider: 'Provider',
    admin: 'Admin'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg fixed h-full">
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-full">
              <FaMapMarkerAlt className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">TourMate</h1>
              {roleLabels[userRole] && (
                <span className={`text-xs px-2 py-0.5 rounded-full bg-${roleColors[userRole]}/10 text-${roleColors[userRole]}`}>
                  {roleLabels[userRole]}
                </span>
              )}
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
                className={`flex items-center justify-between px-4 py-3 rounded-lg mb-2 transition ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="text-xl" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="ml-64 flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex-1"></div>

            <div className="flex items-center space-x-4">
              {/* SOS Button (Tourist only) */}
              {userRole === 'tourist' && (
                <button className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
                  <FaPhoneAlt />
                  <span className="font-medium">SOS</span>
                </button>
              )}

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <FaBell className="text-xl" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-3 border-l pl-4">
                <img
                  src={user?.avatar || 'https://ui-avatars.com/api/?name=' + user?.name}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="hidden md:block">
                  <div className="font-medium text-gray-800">{user?.name?.split(' ')[0] || 'JD'}</div>
                  <div className="text-xs text-gray-500 capitalize">{userRole}</div>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Logout"
              >
                <FaSignOutAlt className="text-xl" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
