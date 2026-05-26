import { useEffect, useMemo, useState } from 'react'
import { FaCalendarAlt, FaMapMarkerAlt, FaRupeeSign, FaUsers } from 'react-icons/fa'
import { tourAPI } from '../../api'
import { toast } from 'react-hot-toast'

const serviceLabels = {
  guide: 'Guide',
  vehicle: 'Vehicle',
  driver: 'Driver',
  hotel: 'Hotel / Stay',
  food: 'Food / Meals',
  tickets: 'Entrance tickets',
  pickup: 'Airport pickup',
  photographer: 'Photographer'
}

const emptyBid = {
  message: '',
  proposedPrice: '',
  itinerary: ''
}

const ProviderRequestsPage = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [bidForm, setBidForm] = useState(emptyBid)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [])

  useEffect(() => {
    if (selectedRequest?.bids?.length) {
      setBidForm((current) => ({
        ...current,
        proposedPrice: current.proposedPrice || selectedRequest.budget?.max || ''
      }))
    }
  }, [selectedRequest])

  const openRequests = useMemo(() => requests.filter((request) => request.status === 'open'), [requests])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await tourAPI.getTourRequests()
      setRequests(res.data.data.tourRequests || [])
      setSelectedRequest((res.data.data.tourRequests || [])[0] || null)
    } catch (error) {
      console.error('Fetch provider requests error:', error)
      toast.error('Failed to load tour requests')
    } finally {
      setLoading(false)
    }
  }

  const handleBidChange = (field, value) => {
    setBidForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmitBid = async (event) => {
    event.preventDefault()
    if (!selectedRequest) return

    try {
      setSubmitting(true)
      await tourAPI.submitBid(selectedRequest._id, {
        message: bidForm.message.trim(),
        proposedPrice: Number(bidForm.proposedPrice),
        itinerary: bidForm.itinerary.trim()
      })
      toast.success('Bid submitted successfully')
      setBidForm(emptyBid)
      fetchRequests()
    } catch (error) {
      console.error('Submit bid error:', error)
      toast.error(error.response?.data?.message || 'Failed to submit bid')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div>Loading requests...</div>

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <section className="xl:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Open Tour Requests</h1>
            <p className="text-gray-600 mt-1">Browse requests created by tourists and submit bids.</p>
          </div>
          <div className="text-sm text-gray-500">{openRequests.length} open request{openRequests.length !== 1 ? 's' : ''}</div>
        </div>

        {openRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-10 text-center text-gray-600">
            No open requests right now.
          </div>
        ) : (
          <div className="space-y-4">
            {openRequests.map((request) => (
              <button
                key={request._id}
                onClick={() => setSelectedRequest(request)}
                className={`w-full text-left bg-white rounded-2xl shadow-sm border p-5 transition hover:shadow-md ${selectedRequest?._id === request._id ? 'ring-2 ring-primary/30 border-primary/20' : ''}`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold text-gray-900">{request.title}</h2>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">{request.status}</span>
                    </div>

                    <div className="text-sm text-gray-600 flex flex-wrap gap-4">
                      <span className="flex items-center gap-2"><FaMapMarkerAlt /> {request.destinations?.join(', ')}</span>
                      <span className="flex items-center gap-2"><FaCalendarAlt /> {request.startDate ? new Date(request.startDate).toLocaleDateString() : '-'} → {request.endDate ? new Date(request.endDate).toLocaleDateString() : '-'}</span>
                      <span className="flex items-center gap-2"><FaUsers /> {request.travelers} traveler{request.travelers > 1 ? 's' : ''}</span>
                      <span className="flex items-center gap-2"><FaRupeeSign /> {request.budget?.min} - {request.budget?.max} {request.budget?.currency}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 shrink-0">Created {new Date(request.createdAt).toLocaleDateString()}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <aside className="bg-white rounded-2xl shadow-sm border p-6 h-fit sticky top-6">
        {selectedRequest ? (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.title}</h2>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 capitalize">{selectedRequest.status}</span>
              </div>
              <p className="text-gray-600 text-sm">Posted by {selectedRequest.tourist?.name || 'Tourist'}</p>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div><strong>Destinations:</strong> {selectedRequest.destinations?.join(', ')}</div>
              <div><strong>Dates:</strong> {selectedRequest.startDate ? new Date(selectedRequest.startDate).toLocaleDateString() : '-'} → {selectedRequest.endDate ? new Date(selectedRequest.endDate).toLocaleDateString() : '-'}</div>
              <div><strong>Travelers:</strong> {selectedRequest.travelers}</div>
              <div><strong>Visitor split:</strong> Male {selectedRequest.visitorBreakdown?.male ?? 0}, Female {selectedRequest.visitorBreakdown?.female ?? 0}, Kids {selectedRequest.visitorBreakdown?.kids ?? 0}</div>
              <div><strong>Accommodation:</strong> {selectedRequest.preferences?.accommodation || 'Any'}</div>
              <div><strong>Transport:</strong> {selectedRequest.preferences?.transportation || 'Any'}</div>
              <div>
                <strong>Services needed:</strong>{' '}
                {(selectedRequest.preferences?.servicesNeeded || []).length > 0
                  ? (selectedRequest.preferences.servicesNeeded || []).map((service) => serviceLabels[service] || service).join(', ')
                  : 'Not specified'}
              </div>
              <div><strong>Activities:</strong> {(selectedRequest.preferences?.activities || []).join(', ') || 'Not specified'}</div>
              <div><strong>Budget:</strong> {selectedRequest.budget?.min} - {selectedRequest.budget?.max} {selectedRequest.budget?.currency}</div>
              {selectedRequest.preferences?.specialRequirements && <div><strong>Notes:</strong> {selectedRequest.preferences.specialRequirements}</div>}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Submit Bid</h3>
              <form onSubmit={handleSubmitBid} className="space-y-3">
                <textarea
                  value={bidForm.message}
                  onChange={(e) => handleBidChange('message', e.target.value)}
                  placeholder="Tell the tourist why your plan fits best..."
                  rows="3"
                  className="input input-bordered w-full min-h-[96px]"
                  required
                />
                <input
                  type="number"
                  min="0"
                  value={bidForm.proposedPrice}
                  onChange={(e) => handleBidChange('proposedPrice', e.target.value)}
                  placeholder="Proposed price"
                  className="input input-bordered w-full"
                  required
                />
                <textarea
                  value={bidForm.itinerary}
                  onChange={(e) => handleBidChange('itinerary', e.target.value)}
                  placeholder="Short itinerary or service plan"
                  rows="4"
                  className="input input-bordered w-full min-h-[112px]"
                  required
                />
                <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                  {submitting ? 'Submitting...' : 'Submit Bid'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Select a request to view details.</div>
        )}
      </aside>
    </div>
  )
}

export default ProviderRequestsPage
