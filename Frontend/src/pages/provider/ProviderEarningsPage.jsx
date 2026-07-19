import { useEffect, useMemo, useState } from 'react'
import { bookingAPI } from '../../api'
import { toast } from 'react-hot-toast'

const ProviderEarningsPage = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const res = await bookingAPI.getMyBookings()
        setBookings(res.data.data.bookings || [])
      } catch (error) {
        console.error('Failed to fetch bookings', error)
        toast.error('Unable to load earnings data')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const totals = useMemo(() => {
    const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.pricing?.totalAmount || 0), 0)
    const completed = bookings.filter((booking) => booking.status === 'completed').length
    const pending = bookings.filter((booking) => booking.status === 'pending' || booking.status === 'confirmed').length
    return { totalRevenue, completed, pending }
  }, [bookings])

  if (loading) {
    return <div className="text-center py-20">Loading earnings...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
        <p className="text-gray-600 mt-1">Review your booking revenue and payout activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="mt-4 text-4xl font-bold text-gray-900">${totals.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-500">Completed Bookings</div>
          <div className="mt-4 text-4xl font-bold text-gray-900">{totals.completed}</div>
        </div>
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-500">Pending / Confirmed</div>
          <div className="mt-4 text-4xl font-bold text-gray-900">{totals.pending}</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Bookings</h2>
        {bookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No bookings available yet.</div>
        ) : (
          <div className="space-y-4">
            {bookings.slice(0, 8).map((booking) => (
              <div key={booking._id} className="rounded-3xl border border-slate-200 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{booking.service?.name || booking.serviceSnapshot?.name || 'Service'}</p>
                    <p className="font-medium text-gray-900">{booking.tourist?.name || 'Guest'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{booking.status}</p>
                    <p className="text-lg font-semibold text-gray-900">${booking.pricing?.totalAmount || '0'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProviderEarningsPage
