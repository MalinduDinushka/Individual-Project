import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { FaStar, FaCheckCircle, FaCommentDots, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa'
import { messageAPI, userAPI } from '../../api'
import { toast } from 'react-hot-toast'

const ProviderProfilePage = () => {
  const { providerId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [provider, setProvider] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProvider()
  }, [providerId])

  const fetchProvider = async () => {
    try {
      setLoading(true)
      const res = await userAPI.getProviderProfile(providerId)
      setProvider(res.data.data.provider)
    } catch (error) {
      console.error('Fetch provider profile error:', error)
      toast.error(error.response?.data?.message || 'Failed to load provider profile')
    } finally {
      setLoading(false)
    }
  }

  const requestId = searchParams.get('request')

  const openChat = () => {
    if (!requestId) {
      toast.error('Missing request context for chat')
      return
    }
    navigate(`/tourist/messages?request=${requestId}&provider=${providerId}`)
  }

  if (loading) return <div>Loading provider profile...</div>

  if (!provider) return <div>Provider profile not found.</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={provider.avatar}
              alt={provider.name}
              className="w-20 h-20 rounded-2xl object-cover border"
            />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-gray-900">{provider.businessInfo?.businessName || provider.name}</h1>
                {provider.isVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                    <FaCheckCircle /> Verified
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-2">{provider.businessInfo?.description || 'Professional provider'}</p>
              <div className="flex items-center gap-3 mt-3 text-sm text-gray-600 flex-wrap">
                <span className="flex items-center gap-2"><FaStar className="text-secondary" /> {provider.businessInfo?.rating ?? 0} rating</span>
                <span>•</span>
                <span>{provider.businessInfo?.reviewCount ?? 0} reviews</span>
                <span>•</span>
                <span className="capitalize">{provider.businessInfo?.serviceType || 'service provider'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 shrink-0">
            {requestId && (
              <button onClick={openChat} className="btn btn-primary flex items-center gap-2">
                <FaCommentDots /> Chat Now
              </button>
            )}
            <a href={`tel:${provider.phone || ''}`} className="btn btn-secondary flex items-center gap-2 justify-center">
              <FaPhoneAlt /> Call
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">Contact & Business</h2>
          <div className="text-sm text-gray-700"><strong>Email:</strong> {provider.email}</div>
          <div className="text-sm text-gray-700"><strong>Phone:</strong> {provider.phone || 'Not provided'}</div>
          <div className="text-sm text-gray-700"><strong>Location:</strong> {provider.businessInfo?.location || 'Not provided'}</div>
          <div className="text-sm text-gray-700"><strong>Service type:</strong> {provider.businessInfo?.serviceType || 'Not provided'}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">About this provider</h2>
          <div className="text-sm text-gray-700 leading-relaxed">
            {provider.businessInfo?.description || 'This provider has not added a detailed description yet.'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Booking context</h2>
        {requestId ? (
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <FaMapMarkerAlt />
            Viewing this provider from your tour request conversation. Use chat to discuss the plan.
          </div>
        ) : (
          <div className="text-sm text-gray-600">No request selected.</div>
        )}
      </div>
    </div>
  )
}

export default ProviderProfilePage
