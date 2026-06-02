import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaDollarSign, FaCalendar, FaStar } from 'react-icons/fa'
import { MdTrendingUp } from 'react-icons/md'
import { useAuthStore } from '../../store/authStore'

const ProviderDashboardHome = () => {
  const user = useAuthStore(state => state.user)
  const [stats, setStats] = useState({
    totalEarnings: 12450,
    earningsGrowth: 18,
    upcomingBookings: 8,
    profileRating: 4.9,
    reviewCount: 127
  })

  const navigate = useNavigate()

  const [tourRequests, setTourRequests] = useState([
    {
      id: 1,
      touristName: 'Sarah Johnson',
      tourType: 'Cultural Tour',
      destinations: ['Sigiriya', 'Dambulla', 'Kandy'],
      dates: 'Feb 10-15, 2026',
      budget: 1200,
      travelers: 4,
      postedAt: '2 hours ago'
    },
    {
      id: 2,
      touristName: 'Michael Chen',
      tourType: 'Wildlife & Beach',
      destinations: ['Yala', 'Mirissa'],
      dates: 'Feb 20-23, 2026',
      budget: 800,
      travelers: 2,
      postedAt: '5 hours ago'
    },
    {
      id: 3,
      touristName: 'Emma Wilson',
      tourType: 'Hill Country',
      destinations: ['Ella', 'Nuwara Eliya'],
      dates: 'Mar 1-5, 2026',
      budget: 950,
      travelers: 3,
      postedAt: '1 day ago'
    }
  ])

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {user?.businessInfo?.businessName || user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">Manage your services and respond to tour requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Earnings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-600 font-medium">Total Earnings</div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FaDollarSign className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            ${stats.totalEarnings.toLocaleString()}
          </div>
          <div className="flex items-center text-sm text-green-600">
            <MdTrendingUp className="mr-1" />
            <span>+{stats.earningsGrowth}% from last month</span>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-600 font-medium">Upcoming Bookings</div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaCalendar className="text-primary text-xl" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">{stats.upcomingBookings}</div>
          <div className="text-sm text-gray-500">Next 30 days</div>
        </div>

        {/* Profile Rating */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-600 font-medium">Profile Rating</div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FaStar className="text-secondary text-xl" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">{stats.profileRating}</div>
          <div className="text-sm text-gray-500">Based on {stats.reviewCount} reviews</div>
        </div>
      </div>

      {/* Open Tour Requests */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Open Tour Requests</h2>
            <p className="text-gray-600 text-sm mt-1">3 new requests</p>
          </div>
        </div>

        <div className="space-y-4">
          {tourRequests.map(request => (
            <div key={request.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{request.touristName}</h3>
                    <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-xs font-semibold">
                      {request.tourType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Posted {request.postedAt}</p>
                </div>
                <button className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                  Preview
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Destinations</div>
                  <div className="flex flex-wrap gap-2">
                    {request.destinations.map(dest => (
                      <span key={dest} className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                        {dest}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Dates</div>
                  <div className="font-medium text-gray-800 flex items-center">
                    <FaCalendar className="mr-2 text-gray-400" />
                    {request.dates}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Budget</div>
                  <div className="font-medium text-gray-800">
                    ${request.budget} • {request.travelers} travelers
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button className="flex-1 btn btn-secondary py-2.5">
                  View Details
                </button>
                <button className="flex-1 btn btn-primary py-2.5">
                  Accept & Bid
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Provider Packages Summary */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Your Packages</h2>
            <p className="text-gray-600 text-sm mt-1">Quick view of saved travel packages</p>
          </div>
          <div className="inline-flex items-center gap-3">
            <button
              onClick={() => navigate('/provider/packages', { state: { openAdd: true } })}
              className="btn btn-primary"
            >
              Add package
            </button>
            <button
              onClick={() => navigate('/provider/packages')}
              className="btn btn-secondary"
            >
              Manage packages
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(user?.businessInfo?.travelPackages || []).slice(0, 6).map((p, i) => (
            <div key={i} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{p.title || 'Untitled package'}</h3>
                  <p className="text-xs text-gray-500 mt-1">{p.duration || ''} • {p.includedDistricts ? (Array.isArray(p.includedDistricts) ? p.includedDistricts.join(', ') : String(p.includedDistricts)) : ''}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">from</div>
                  <div className="text-lg font-bold text-gray-800">{p.price?.amount ? `$${p.price.amount}` : '-'}</div>
                </div>
              </div>
            </div>
          ))}

          {(user?.businessInfo?.travelPackages || []).length === 0 && (
            <div className="rounded-xl border bg-white p-6 shadow-sm text-sm text-gray-600">No packages found. Click "Add package" to create your first package.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProviderDashboardHome
