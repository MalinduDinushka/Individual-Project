import { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { adminAPI } from '../../api'
import { toast } from 'react-hot-toast'

const AdminReportsPage = () => {
  const [stats, setStats] = useState(null)
  const [bookingsData, setBookingsData] = useState([])
  const [registrationsData, setRegistrationsData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        const res = await adminAPI.getDashboardStats()
        if (res.data.success) {
          setStats(res.data.data.stats)
          setBookingsData(res.data.data.bookingsData || [])
          setRegistrationsData(res.data.data.registrationsData || [])
        }
      } catch (error) {
        console.error('Admin reports error', error)
        toast.error('Unable to load reports')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  if (loading) {
    return <div className="text-center py-20">Loading reports...</div>
  }

  if (!stats) {
    return <div className="text-center py-20 text-gray-500">No report data available.</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Platform performance metrics and growth trends.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="mt-4 text-3xl font-semibold text-gray-900">{stats.totalUsers}</p>
        </div>
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Active Providers</p>
          <p className="mt-4 text-3xl font-semibold text-gray-900">{stats.activeProviders}</p>
        </div>
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Bookings</p>
          <p className="mt-4 text-3xl font-semibold text-gray-900">{stats.totalBookings}</p>
        </div>
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Active SOS</p>
          <p className="mt-4 text-3xl font-semibold text-gray-900">{stats.activeSOS}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Bookings</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={bookingsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="bookings" fill="#127B96" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Registrations</h2>
          <ResponsiveContainer width="100%" height={280}>
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
    </div>
  )
}

export default AdminReportsPage
