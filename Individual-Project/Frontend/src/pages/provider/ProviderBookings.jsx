import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingAPI } from '../../api'
import { toast } from 'react-hot-toast'

const ProviderBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await bookingAPI.getMyBookings()
      setBookings(res.data.data.bookings || [])
    } catch (err) {
      console.error('Fetch provider bookings error:', err)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Incoming Bookings</h2>
      {bookings.length === 0 && <div>No incoming bookings yet.</div>}

      <div className="grid grid-cols-1 gap-4">
        {bookings.map(b => (
          <div key={b._id} className="p-4 bg-white rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{b.service?.name || b.serviceSnapshot?.name || 'Service'}</h3>
                <div className="text-sm text-gray-500">{b.bookingDate?.startDate ? new Date(b.bookingDate.startDate).toLocaleDateString() : ''} - {b.bookingDate?.endDate ? new Date(b.bookingDate.endDate).toLocaleDateString() : ''}</div>
                <div className="text-sm text-gray-600">Tourist: {b.tourist?.name || 'Guest'}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{b.pricing?.currency || '$'}{b.pricing?.totalAmount}</div>
                <div className="text-sm text-gray-500">Status: {b.status} • Payment: {b.paymentStatus}</div>
                {(b.status === 'confirmed' || b.status === 'in-progress' || b.status === 'completed') && (
                  <button onClick={() => navigate(`/provider/messages?booking=${b._id}`)} className="btn btn-secondary mt-2">Chat</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProviderBookings
