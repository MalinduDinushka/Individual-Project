import { useState, useEffect } from 'react'
import { FaUsers, FaShieldAlt, FaCalendar, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { MdTrendingUp } from 'react-icons/md'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { adminAPI } from '../../api'
import { toast } from 'react-hot-toast'

const AdminDashboardHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersGrowth: 0,
    activeProviders: 0,
    verifiedPercent: 0,
    totalBookings: 0,
    activeSOS: 0
  })

  const [bookingsData, setBookingsData] = useState([])
  const [registrationsData, setRegistrationsData] = useState([])
  const [verifications, setVerifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard stats
      const statsResponse = await adminAPI.getDashboardStats()
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data.stats)
        setBookingsData(statsResponse.data.data.bookingsData)
        setRegistrationsData(statsResponse.data.data.registrationsData)
      }

      // Fetch verifications
      const verificationsResponse = await adminAPI.getVerifications()
      if (verificationsResponse.data.success) {
        setVerifications(verificationsResponse.data.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (providerId, action) => {
    try {
      const response = await adminAPI.verifyProvider(providerId, { action })
      if (response.data.success) {
        toast.success(response.data.message)
        fetchDashboardData() // Refresh data
      }
    } catch (error) {
      console.error('Verification error:', error)
      toast.error(error.response?.data?.message || 'Verification failed')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Platform overview and management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-600 font-medium text-sm">Total Users</div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaUsers className="text-primary text-xl" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {stats.totalUsers.toLocaleString()}
          </div>
          <div className="flex items-center text-sm text-green-600">
            <MdTrendingUp className="mr-1" />
            <span>+{stats.usersGrowth} this week</span>
          </div>
        </div>

        {/* Active Providers */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-600 font-medium text-sm">Active Providers</div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FaShieldAlt className="text-purple-600 text-xl" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">{stats.activeProviders}</div>
          <div className="text-sm text-gray-500">{stats.verifiedPercent}% verified</div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-600 font-medium text-sm">Total Bookings</div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FaCalendar className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {stats.totalBookings.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">This month</div>
        </div>

        {/* Active SOS */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-600 font-medium text-sm">Active SOS</div>
            <div className="bg-red-100 p-3 rounded-lg">
              <FaExclamationTriangle className="text-red-600 text-xl" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">{stats.activeSOS}</div>
          <div className="text-sm text-red-600">Requires attention</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Bookings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Daily Bookings</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bookingsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="bookings" fill="#127B96" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* New User Registrations */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">New User Registrations</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={registrationsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="providers" stroke="#F59E0B" strokeWidth={2} name="Providers" />
              <Line type="monotone" dataKey="tourists" stroke="#127B96" strokeWidth={2} name="Tourists" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pending Verifications */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Pending Verifications</h3>
            <p className="text-sm text-red-600 mt-1">
              {verifications.length} {verifications.length === 1 ? 'pending' : 'pending'}
            </p>
          </div>
        </div>

        {verifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No pending verifications
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Provider Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Documents</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Submitted</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {verifications.map(verification => (
                  <tr key={verification.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-800">{verification.providerName}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{verification.type}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <span className="mr-1">📍</span>
                        {verification.location}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        verification.status === 'complete' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {verification.documents}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{verification.submitted}</td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleVerification(verification.id, 'approve')}
                          className="flex items-center space-x-1 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition"
                        >
                          <FaCheckCircle />
                          <span>Approve</span>
                        </button>
                        <button 
                          onClick={() => handleVerification(verification.id, 'reject')}
                          className="flex items-center space-x-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition"
                        >
                          <FaTimesCircle />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboardHome
