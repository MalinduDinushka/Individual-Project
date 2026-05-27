import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingAPI, feedbackAPI } from '../../api'
import PayHereCheckoutButton from '../../components/payments/PayHereCheckoutButton'
import { toast } from 'react-hot-toast'
import FeedbackForm from '../../components/feedback/FeedbackForm'

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeBooking, setActiveBooking] = useState(null)
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
                {b.status === 'completed' && (
                  <>
                    <button onClick={() => setActiveBooking(b)} className="btn btn-outline mt-2 ml-2">Leave feedback</button>
                  </>
                )}
                {b.paymentStatus === 'pending' && (
                  <PayHereCheckoutButton
                    paymentType="booking"
                    bookingId={b._id}
                    items={b.serviceSnapshot?.name || b.service?.name || 'TourMate booking'}
                    amount={b.pricing?.totalAmount}
                    className="btn btn-primary mt-2"
                    onCreated={() => toast.success('Redirecting to PayHere sandbox...')}
                    onError={(error) => toast.error(error.response?.data?.message || 'Failed to start PayHere checkout')}
                  >
                    Pay Now
                  </PayHereCheckoutButton>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded w-full max-w-2xl mx-4">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Leave feedback for {activeBooking.serviceSnapshot?.name || activeBooking.service?.name || 'service'}</h3>
              <button onClick={() => setActiveBooking(null)} className="text-gray-600 hover:text-gray-900">✕</button>
            </div>
            <FeedbackForm booking={activeBooking} onClose={() => setActiveBooking(null)} onSubmitted={() => fetchBookings()} />
          </div>
        </div>
      )}
    </div>
  )
}

export default MyBookings
