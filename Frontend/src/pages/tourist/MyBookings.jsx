import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingAPI, paymentAPI } from '../../api'
import { toast } from 'react-hot-toast'

const MyBookings = () => {
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
      console.error('Fetch bookings error:', err)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async (bookingId) => {
    try {
      toast.loading('Processing payment...')
      const res = await paymentAPI.createPayment({ bookingId, paymentMethod: 'card' })
      toast.dismiss()
      toast.success('Payment successful')
      // Refresh bookings
      fetchBookings()
    } catch (err) {
      toast.dismiss()
      console.error('Payment error:', err)
      toast.error('Payment failed')
    }
  }

  if (loading) return <div>Loading bookings...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Bookings</h2>
      {bookings.length === 0 && <div>No bookings yet.</div>}

      <div className="grid grid-cols-1 gap-4">
        {bookings.map(b => (
          <div key={b._id} className="p-4 bg-white rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{b.service?.name || 'Service'}</h3>
                <div className="text-sm text-gray-500">{b.bookingDate?.startDate ? new Date(b.bookingDate.startDate).toLocaleDateString() : ''} - {b.bookingDate?.endDate ? new Date(b.bookingDate.endDate).toLocaleDateString() : ''}</div>
                <div className="text-sm text-gray-600">People: {b.numberOfPeople}</div>
                <div className="text-sm text-gray-600">Service: {b.serviceSnapshot?.name || b.service?.name || 'Service'}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{b.pricing?.currency || '$'}{b.pricing?.totalAmount}</div>
                <div className="text-sm text-gray-500">Status: {b.status} • Payment: {b.paymentStatus}</div>
                {(b.status === 'confirmed' || b.status === 'in-progress' || b.status === 'completed') && (
                  <button onClick={() => navigate(`/tourist/messages?booking=${b._id}`)} className="btn btn-secondary mt-2 mr-2">Chat</button>
                )}
                {b.paymentStatus === 'pending' && (
                  <button onClick={() => handlePay(b._id)} className="btn btn-primary mt-2">Pay Now</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyBookings
