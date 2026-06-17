import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { FaStar, FaCheckCircle, FaCommentDots, FaPhoneAlt, FaMapMarkerAlt, FaCamera, FaRoute } from 'react-icons/fa'
import { messageAPI, userAPI } from '../../api'
import VerifiedBadge from '../../components/VerifiedBadge'
import { toast } from 'react-hot-toast'

const buildGoogleMapsEmbedUrl = (location) => {
  const query = String(location || '').trim()
  if (!query) return ''
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
}

const photoCategoryLabels = {
  profile: 'Profile',
  guide: 'Guide',
  vehicle: 'Vehicle',
  hotel: 'Hotel / Guest house',
  restaurant: 'Restaurant',
  photographer: 'Photographer',
  equipment: 'Equipment',
  other: 'Other'
}

const groupPhotosByCategory = (photos = []) => {
  return photos.reduce((acc, photo) => {
    const key = photo?.type || 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(photo)
    return acc
  }, {})
}

const normalizeText = (value) => String(value || '').trim().toLowerCase()

const packageMatchesSelectedRequest = (travelPackage = {}, selectedLocationText = '') => {
  if (!selectedLocationText) return true
  const includedDistricts = Array.isArray(travelPackage.includedDistricts) ? travelPackage.includedDistricts : []
  return includedDistricts.some((district) => normalizeText(selectedLocationText).includes(normalizeText(district)) || normalizeText(district).includes(normalizeText(selectedLocationText)))
}

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
  const selectedDistrictText = searchParams.get('districts') || ''

  const openChat = () => {
    if (!requestId) {
      toast.error('Missing request context for chat')
      return
    }
    navigate(`/tourist/messages?request=${requestId}&provider=${providerId}`)
  }

  if (loading) return <div>Loading provider profile...</div>

  if (!provider) return <div>Provider profile not found.</div>

  const groupedPhotos = groupPhotosByCategory(provider.photos || [])
  const travelPackages = Array.isArray(provider.businessInfo?.travelPackages) ? provider.businessInfo.travelPackages.filter((pkg) => packageMatchesSelectedRequest(pkg, selectedDistrictText)) : []

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
                <VerifiedBadge isVerified={provider.isVerified} verificationStatus={provider.verificationStatus} size="md" />
              </div>
              <p className="text-gray-600 mt-2">{provider.businessInfo?.description || 'Professional provider'}</p>
              <div className="flex items-center gap-3 mt-3 text-sm text-gray-600 flex-wrap">
                <span className="flex items-center gap-2"><FaStar className="text-secondary" /> {provider.businessInfo?.rating ?? 0} rating</span>
                <span>•</span>
                <span>{provider.businessInfo?.reviewCount ?? 0} reviews</span>
                <span>•</span>
                <span className="capitalize">{provider.gender || 'gender not specified'}</span>
                <span>•</span>
                <span className="capitalize">
                  {(provider.businessInfo?.serviceTypes?.length ? provider.businessInfo.serviceTypes : [provider.businessInfo?.serviceType])
                    .filter(Boolean)
                    .join(', ') || 'service provider'}
                </span>
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
          <div className="text-sm text-gray-700"><strong>Gender:</strong> {provider.gender || 'Not provided'}</div>
          <div className="text-sm text-gray-700">
            <strong>Location:</strong>{' '}
            {provider.businessInfo?.location || 'Not provided'}
          </div>
          {provider.businessInfo?.location && (
            <div className="rounded-xl border overflow-hidden bg-gray-50">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b bg-white">
                <div>
                  <p className="font-medium text-gray-800">Map preview</p>
                  <p className="text-xs text-gray-500">Open or preview this business location</p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.businessInfo.location)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Open in Google Maps
                </a>
              </div>
              <iframe
                title="Provider location preview"
                src={buildGoogleMapsEmbedUrl(provider.businessInfo.location)}
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
          <div className="text-sm text-gray-700">
            <strong>Service types:</strong>{' '}
            {(provider.businessInfo?.serviceTypes?.length ? provider.businessInfo.serviceTypes : [provider.businessInfo?.serviceType])
              .filter(Boolean)
              .join(', ') || 'Not provided'}
          </div>
          {provider.businessInfo?.serviceDetails && (
            <div className="text-sm text-gray-700">
              <strong>Service details:</strong>{' '}
              {Object.entries(provider.businessInfo.serviceDetails)
                .filter(([, details]) => details && Object.values(details).some(Boolean))
                .map(([service, details]) => `${service}: ${Object.entries(details).filter(([, value]) => Boolean(value)).map(([field, value]) => `${field}=${value}`).join('; ')}`)
                .join(' | ') || 'Not provided'}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">About this provider</h2>
          <div className="text-sm text-gray-700 leading-relaxed">
            {provider.businessInfo?.description || 'This provider has not added a detailed description yet.'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Provider gallery</h2>
            <p className="text-sm text-gray-500 mt-1">Photos uploaded during registration, grouped by category.</p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <FaCamera />
            <span>{(provider.photos || []).length} photo{(provider.photos || []).length === 1 ? '' : 's'}</span>
          </div>
        </div>

        {Object.keys(groupedPhotos).length === 0 ? (
          <div className="text-sm text-gray-600 bg-gray-50 border rounded-xl p-4">No photos have been added by this provider yet.</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPhotos).map(([category, photos]) => (
              <div key={category}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{photoCategoryLabels[category] || category}</h3>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{photos.length} item{photos.length === 1 ? '' : 's'}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <figure key={`${photo.url}-${index}`} className="overflow-hidden rounded-2xl border bg-gray-50 shadow-sm">
                      <img
                        src={photo.url}
                        alt={photo.label || `${category} photo`}
                        className="h-44 w-full object-cover"
                      />
                      <figcaption className="p-3 text-xs text-gray-600 bg-white border-t">
                        <div className="font-medium text-gray-800 truncate">{photo.label || 'Photo'}</div>
                        <div className="mt-1 uppercase tracking-wide text-[10px] text-gray-500">{photo.type || 'other'}</div>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Travel packages</h2>
            <p className="text-sm text-gray-500 mt-1">Packages and prices shared by this provider.</p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <FaRoute />
            <span>{travelPackages.length} available</span>
          </div>
        </div>

        {travelPackages.length === 0 ? (
          <div className="text-sm text-gray-600 bg-gray-50 border rounded-xl p-4">No travel packages match your current trip selection.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {travelPackages.map((travelPackage, index) => (
              <div key={`${travelPackage.title || 'package'}-${index}`} className="rounded-2xl border bg-slate-50 p-5 space-y-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{travelPackage.title || 'Travel package'}</h3>
                    <p className="text-sm text-gray-500 mt-1">{travelPackage.duration || 'Flexible duration'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="mb-1 inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600 border">
                      {(travelPackage.serviceType || provider.businessInfo?.serviceType || 'package') + ''}
                    </div>
                    <div className="text-base font-bold text-primary">
                      {travelPackage.price?.currency || 'USD'} {travelPackage.price?.amount ?? 'N/A'}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-6">{travelPackage.description || 'No package description provided.'}</p>
                {Array.isArray(travelPackage.images) && travelPackage.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {travelPackage.images.map((image, imageIndex) => (
                      <figure key={`${image.url || index}-${imageIndex}`} className="overflow-hidden rounded-xl border bg-white">
                        <img
                          src={image.url}
                          alt={image.label || `${travelPackage.title || 'Travel package'} image`}
                          className="h-32 w-full object-cover"
                        />
                        {image.label && (
                          <figcaption className="px-3 py-2 text-xs text-gray-600 border-t bg-white truncate">
                            {image.label}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                )}
                {Array.isArray(travelPackage.foodImages) && travelPackage.foodImages.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">Food images</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {travelPackage.foodImages.map((image, imageIndex) => (
                        <figure key={`${image.url || index}-${imageIndex}`} className="overflow-hidden rounded-xl border bg-white">
                          <img
                            src={image.url}
                            alt={image.label || `${travelPackage.title || 'Travel package'} food image`}
                            className="h-32 w-full object-cover"
                          />
                          {image.label && (
                            <figcaption className="px-3 py-2 text-xs text-gray-600 border-t bg-white truncate">
                              {image.label}
                            </figcaption>
                          )}
                        </figure>
                      ))}
                    </div>
                  </div>
                )}
                {travelPackage.details?.hotel && provider.businessInfo?.serviceType === 'hotel' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700 border-t pt-3">
                    <div><strong>Rooms:</strong> {travelPackage.details.hotel.roomCount || 'Not provided'}</div>
                    <div><strong>Room types:</strong> {travelPackage.details.hotel.roomTypes || 'Not provided'}</div>
                    <div><strong>Meal plan:</strong> {travelPackage.details.hotel.mealPlan || 'Not provided'}</div>
                    <div><strong>Amenities:</strong> {travelPackage.details.hotel.amenities || 'Not provided'}</div>
                  </div>
                )}
                {travelPackage.details?.vehicle && provider.businessInfo?.serviceType === 'vehicle' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700 border-t pt-3">
                    <div><strong>Vehicle types:</strong> {travelPackage.details.vehicle.vehicleTypes || 'Not provided'}</div>
                    <div><strong>Capacity:</strong> {travelPackage.details.vehicle.capacity || 'Not provided'}</div>
                    <div><strong>Driver included:</strong> {travelPackage.details.vehicle.driverIncluded ? 'Yes' : 'No'}</div>
                    <div><strong>Air conditioned:</strong> {travelPackage.details.vehicle.airConditioned ? 'Yes' : 'No'}</div>
                  </div>
                )}
                {Array.isArray(travelPackage.highlights) && travelPackage.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {travelPackage.highlights.map((highlight) => (
                      <span key={highlight} className="rounded-full bg-white border px-3 py-1 text-xs text-gray-600">
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
                {Array.isArray(travelPackage.includedDistricts) && travelPackage.includedDistricts.length > 0 && (
                  <div className="text-xs text-gray-500">Districts: {travelPackage.includedDistricts.join(', ')}</div>
                )}
              </div>
            ))}
          </div>
        )}
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
