import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingAPI, tourAPI } from '../../api'
import { toast } from 'react-hot-toast'
import FeedbackForm from '../../components/feedback/FeedbackForm'
import PayHereCheckoutButton from '../../components/payments/PayHereCheckoutButton'

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [confirmedRequests, setConfirmedRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeBooking, setActiveBooking] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const [bookingsRes, requestsRes] = await Promise.all([
        bookingAPI.getMyBookings(),
        tourAPI.getMyRequests()
      ])

      setBookings(bookingsRes.data.data.bookings || [])
      const confirmed = (requestsRes.data.data.tourRequests || []).filter((request) => {
        const acceptedBid = request.bids?.find((bid) => bid.status === 'accepted')
        return Boolean(acceptedBid) && ['awaiting-payment', 'in-progress', 'completed'].includes(request.status)
      })
      setConfirmedRequests(confirmed)
    } catch (err) {
      console.error('Fetch bookings error:', err)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading bookings...</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Trips</h2>
        <p className="text-sm text-gray-500 mt-1">Your confirmed bookings and accepted custom requests live here.</p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Confirmed requests</h3>
          <span className="text-sm text-gray-500">{confirmedRequests.length} trip{confirmedRequests.length === 1 ? '' : 's'}</span>
        </div>

        {confirmedRequests.length === 0 ? (
          <div className="rounded-xl border bg-white p-4 text-sm text-gray-500">No confirmed tour requests yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {confirmedRequests.map((request) => {
              const acceptedBid = request.bids?.find((bid) => bid.status === 'accepted')
              const statusLabel = request.status === 'awaiting-payment'
                ? 'Confirmed - awaiting payment'
                : request.status === 'in-progress'
                  ? 'In progress'
                  : 'Completed'

              return (
                <div key={request._id} className="p-4 bg-white rounded shadow">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{request.title}</h3>
                      <div className="text-sm text-gray-500">
                        {request.startDate ? new Date(request.startDate).toLocaleDateString() : ''} - {request.endDate ? new Date(request.endDate).toLocaleDateString() : ''}
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Districts:</strong> {(request.districts || []).join(', ') || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Places:</strong> {(request.destinations || []).slice(0, 6).join(', ') || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Provider:</strong> {acceptedBid?.provider?.businessInfo?.businessName || acceptedBid?.provider?.name || 'Confirmed provider'}
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-2">
                      <div className="font-bold text-lg">{request.advancePayment?.currency || request.budget?.currency || 'USD'} {request.advancePayment?.amount || acceptedBid?.proposedPrice || request.budget?.max || '—'}</div>
                      <div className="text-sm text-gray-500">{statusLabel}</div>
                      {request.status === 'awaiting-payment' && acceptedBid && (
                        <button onClick={() => navigate('/tourist/requests')} className="btn btn-primary mt-2">
                          Complete payment
                        </button>
                      )}
                      {acceptedBid && (
                        <button onClick={() => navigate(`/tourist/messages?request=${request._id}&provider=${acceptedBid.provider?._id || acceptedBid.provider?.id}`)} className="btn btn-secondary mt-2 ml-2">
                          Chat
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Bookings</h3>
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
                  <div className="mt-2 flex flex-col gap-2">
                    <PayHereCheckoutButton bookingId={b._id} label="Pay with PayHere" />
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      PayHere sandbox checkout is enabled for this booking.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      </section>
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
