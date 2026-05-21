import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaMapMarkerAlt, FaRupeeSign, FaStar } from 'react-icons/fa'
import { tourAPI } from '../../api'
import { toast } from 'react-hot-toast'

const TourRequestsPage = () => {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await tourAPI.getMyRequests()
      setRequests(res.data.data.tourRequests || [])
    } catch (error) {
      console.error('Fetch requests error:', error)
      toast.error('Failed to load tour requests')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading tour requests...</div>

  const openChat = (requestId, providerId) => {
    navigate(`/tourist/messages?request=${requestId}&provider=${providerId}`)
  }

  const openProviderProfile = (providerId, requestId) => {
    navigate(`/tourist/provider/${providerId}?request=${requestId}`)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Tour Requests</h1>
          <p className="text-gray-600 mt-1">Track your custom travel plans and provider bids.</p>
        </div>
        <button onClick={() => navigate('/tourist/requests/new')} className="btn btn-primary">
          New Request
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border p-10 text-center text-gray-600">
          No tour requests yet. Create your first custom request.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-gray-900">{request.title}</h2>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">{request.status}</span>
                  </div>

                  <div className="text-sm text-gray-600 flex flex-wrap gap-4">
                    <span className="flex items-center gap-2"><FaMapMarkerAlt /> {request.destinations?.join(', ')}</span>
                    <span className="flex items-center gap-2"><FaCalendarAlt /> {request.startDate ? new Date(request.startDate).toLocaleDateString() : '-'} → {request.endDate ? new Date(request.endDate).toLocaleDateString() : '-'}</span>
                    <span className="flex items-center gap-2"><FaRupeeSign /> {request.budget?.min} - {request.budget?.max} {request.budget?.currency}</span>
                  </div>

                  <div className="text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div><strong>Travelers:</strong> {request.travelers}</div>
                    <div><strong>Transport:</strong> {request.preferences?.transportation || 'Any'}</div>
                    <div><strong>Accommodation:</strong> {request.preferences?.accommodation || 'Any'}</div>
                    <div><strong>Activities:</strong> {(request.preferences?.activities || []).join(', ') || 'Not specified'}</div>
                  </div>

                  {request.preferences?.specialRequirements && (
                    <div className="text-sm text-gray-600">
                      <strong>Special requirements:</strong> {request.preferences.specialRequirements}
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">Provider bids</h3>
                      <span className="text-sm text-gray-500">{request.bids?.length || 0} bid{(request.bids?.length || 0) === 1 ? '' : 's'}</span>
                    </div>

                    {request.bids?.length ? (
                      <div className="space-y-3">
                        {request.bids.map((bid) => {
                          const provider = bid.provider
                          const providerId = provider?._id || provider?.id
                          return (
                            <div key={bid._id} className="bg-gray-50 rounded-xl p-4 border">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <button
                                    type="button"
                                    onClick={() => openProviderProfile(providerId, request._id)}
                                    className="text-left font-semibold text-primary hover:underline"
                                  >
                                    {provider?.businessInfo?.businessName || provider?.name || 'Provider'}
                                  </button>
                                  <div className="text-sm text-gray-600">{provider?.businessInfo?.description || provider?.email || 'Verified provider'}</div>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <FaStar className="text-secondary" />
                                    <span>{provider?.businessInfo?.rating ?? 0}</span>
                                    <span>•</span>
                                    <span>{bid.proposedPrice} {request.budget?.currency}</span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => openProviderProfile(providerId, request._id)}
                                    className="btn btn-secondary btn-sm mb-2"
                                  >
                                    View Profile
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openChat(request._id, providerId)}
                                    className="btn btn-primary btn-sm"
                                  >
                                    Chat
                                  </button>
                                </div>
                              </div>
                              <div className="mt-3 text-sm text-gray-700">
                                <strong>Itinerary:</strong> {bid.itinerary}
                              </div>
                              <div className="mt-2 text-sm text-gray-700">
                                <strong>Message:</strong> {bid.message}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4">No bids yet.</div>
                    )}
                  </div>
                </div>

                <div className="text-right space-y-2 shrink-0">
                  <div className="text-sm text-gray-500">Created {new Date(request.createdAt).toLocaleDateString()}</div>
                  <span className="inline-flex px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-500">Bids from providers will appear here</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TourRequestsPage