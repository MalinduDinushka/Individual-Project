import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authAPI } from '../../api'
import { sriLankaDistricts } from '../../data/sriLankaTour'
import { useAuthStore } from '../../store/authStore'

const providerPackageLabels = {
  guide: 'Guide package',
  vehicle: 'Vehicle package',
  hotel: 'Hotel package',
  restaurant: 'Restaurant package',
  photographer: 'Photography package',
  equipment: 'Equipment package',
  other: 'General package'
}

const createDefaultTravelPackage = (serviceType = 'other') => ({
  serviceType,
  title: '',
  description: '',
  includedDistricts: [],
  duration: '',
  highlights: '',
  images: [],
  foodImages: [],
  details: {
    hotel: {
      roomCount: '',
      roomTypes: '',
      mealPlan: '',
      amenities: ''
    },
    vehicle: {
      vehicleTypes: '',
      capacity: '',
      driverIncluded: true,
      airConditioned: true
    }
  },
  price: {
    amount: '',
    currency: 'USD'
  }
})

const uploadPackageImage = async (file) => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const form = new FormData()
  form.append('avatar', file)

  const auth = JSON.parse(localStorage.getItem('tourmate-auth'))
  const token = auth?.state?.token
  const res = await fetch(base + '/auth/avatar-public', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form
  })
  const json = await res.json().catch(() => ({}))

  if (!res.ok) {
    const error = new Error(json?.message || 'Image upload failed')
    error.response = { data: json }
    throw error
  }

  return json?.data?.avatar || ''
}

const normalizePackageImages = (images = []) => {
  return images
    .map((image) => {
      if (!image) return null

      if (typeof image === 'string') {
        const url = String(image || '').trim()
        return url ? { url, label: '' } : null
      }

      const url = String(image.url || image.src || '').trim()
      if (!url) return null

      return {
        url,
        label: String(image.label || image.caption || '').trim()
      }
    })
    .filter(Boolean)
}

const normalizeTravelPackages = (travelPackages = [], serviceType = 'other') => {
  return travelPackages
    .map((item) => {
      const title = String(item.title || '').trim()
      const description = String(item.description || '').trim()
      const nextServiceType = String(item.serviceType || serviceType || 'other').trim() || 'other'
      const includedDistricts = Array.isArray(item.includedDistricts)
        ? item.includedDistricts.map((d) => String(d || '').trim()).filter(Boolean)
        : String(item.includedDistricts || '')
            .split(',')
            .map((district) => district.trim())
            .filter(Boolean)
      const duration = String(item.duration || '').trim()
      const highlights = String(item.highlights || '')
        .split(',')
        .map((highlight) => highlight.trim())
        .filter(Boolean)
      const images = normalizePackageImages(item.images)
      const foodImages = normalizePackageImages(item.foodImages)
      const hotelDetails = item.details?.hotel && typeof item.details.hotel === 'object' ? item.details.hotel : {}
      const vehicleDetails = item.details?.vehicle && typeof item.details.vehicle === 'object' ? item.details.vehicle : {}
      const amount = Number(item.price?.amount)
      const currency = String(item.price?.currency || 'USD').trim() || 'USD'

      if (!title && !description && includedDistricts.length === 0 && !Number.isFinite(amount) && !duration && highlights.length === 0 && images.length === 0 && foodImages.length === 0) {
        return null
      }

      return {
        serviceType: nextServiceType,
        title,
        description,
        includedDistricts,
        duration,
        highlights,
        images,
        foodImages,
        details: {
          hotel: hotelDetails,
          vehicle: vehicleDetails
        },
        price: Number.isFinite(amount) ? { amount, currency } : undefined
      }
    })
    .filter(Boolean)
}

const ProviderPackagesPage = () => {
  const { user, updateUser } = useAuthStore()
  const providerServiceType = String(user?.businessInfo?.serviceType || user?.businessInfo?.serviceTypes?.[0] || 'other').trim() || 'other'
  const [packages, setPackages] = useState([createDefaultTravelPackage(providerServiceType)])
  const [saving, setSaving] = useState(false)
  const [uploadingPackageImageIndex, setUploadingPackageImageIndex] = useState(null)
  const [uploadingFoodImageIndex, setUploadingFoodImageIndex] = useState(null)
  const location = useLocation()
  const [editingIndex, setEditingIndex] = useState(null)

  const mapUserPackages = () => {
    const existing = user?.businessInfo?.travelPackages?.length
      ? user.businessInfo.travelPackages.map((item) => ({
          serviceType: item.serviceType || providerServiceType,
          title: item.title || '',
          description: item.description || '',
          includedDistricts: Array.isArray(item.includedDistricts)
            ? item.includedDistricts
            : String(item.includedDistricts || '')
                .split(',')
                .map((d) => d.trim())
                .filter(Boolean),
          duration: item.duration || '',
          highlights: Array.isArray(item.highlights) ? item.highlights.join(', ') : '',
          images: Array.isArray(item.images)
            ? item.images.map((image) => ({
                url: image?.url || '',
                label: image?.label || ''
              })).filter((image) => image.url)
            : [],
          foodImages: Array.isArray(item.foodImages)
            ? item.foodImages.map((image) => ({
                url: image?.url || '',
                label: image?.label || ''
              })).filter((image) => image.url)
            : [],
          details: {
            hotel: {
              roomCount: item.details?.hotel?.roomCount ?? '',
              roomTypes: item.details?.hotel?.roomTypes ?? '',
              mealPlan: item.details?.hotel?.mealPlan ?? '',
              amenities: item.details?.hotel?.amenities ?? ''
            },
            vehicle: {
              vehicleTypes: item.details?.vehicle?.vehicleTypes ?? '',
              capacity: item.details?.vehicle?.capacity ?? '',
              driverIncluded: item.details?.vehicle?.driverIncluded ?? true,
              airConditioned: item.details?.vehicle?.airConditioned ?? true
            }
          },
          price: {
            amount: item.price?.amount ?? '',
            currency: item.price?.currency || 'USD'
          }
        }))
      : [createDefaultTravelPackage(providerServiceType)]

    setPackages(existing)
  }

  useEffect(() => {
    const existing = user?.businessInfo?.travelPackages?.length
      ? user.businessInfo.travelPackages.map((item) => ({
          serviceType: item.serviceType || providerServiceType,
          title: item.title || '',
          description: item.description || '',
          includedDistricts: Array.isArray(item.includedDistricts)
            ? item.includedDistricts
            : String(item.includedDistricts || '')
                .split(',')
                .map((d) => d.trim())
                .filter(Boolean),
          duration: item.duration || '',
          highlights: Array.isArray(item.highlights) ? item.highlights.join(', ') : '',
          images: Array.isArray(item.images)
            ? item.images.map((image) => ({
                url: image?.url || '',
                label: image?.label || ''
              })).filter((image) => image.url)
            : [],
          foodImages: Array.isArray(item.foodImages)
            ? item.foodImages.map((image) => ({
                url: image?.url || '',
                label: image?.label || ''
              })).filter((image) => image.url)
            : [],
          details: {
            hotel: {
              roomCount: item.details?.hotel?.roomCount ?? '',
              roomTypes: item.details?.hotel?.roomTypes ?? '',
              mealPlan: item.details?.hotel?.mealPlan ?? '',
              amenities: item.details?.hotel?.amenities ?? ''
            },
            vehicle: {
              vehicleTypes: item.details?.vehicle?.vehicleTypes ?? '',
              capacity: item.details?.vehicle?.capacity ?? '',
              driverIncluded: item.details?.vehicle?.driverIncluded ?? true,
              airConditioned: item.details?.vehicle?.airConditioned ?? true
            }
          },
          price: {
            amount: item.price?.amount ?? '',
            currency: item.price?.currency || 'USD'
          }
        }))
      : [createDefaultTravelPackage(providerServiceType)]

    setPackages(existing)
  }, [user, providerServiceType])

  useEffect(() => {
    if (location?.state?.openAdd) {
      try {
        history.replaceState({ ...(history.state || {}), usr: { ...((history.state || {}).usr || {}) } }, '')
      } catch (e) {
        // ignore
      }
      // add and open the new package form
      const newIdx = packages.length
      setPackages((prev) => [...prev, createDefaultTravelPackage(providerServiceType)])
      setEditingIndex(newIdx)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.state?.openAdd])

  const isBlankPackage = (pkg) => {
    if (!pkg) return true
    const empty = (p) => p === undefined || p === null || String(p).trim() === ''
    if (!empty(pkg.title)) return false
    if (!empty(pkg.description)) return false
    if (Array.isArray(pkg.includedDistricts) && pkg.includedDistricts.length > 0) return false
    if (pkg.images && pkg.images.length > 0) return false
    if (pkg.price && pkg.price.amount) return false
    return true
  }

  const handleAddPackageClick = () => {
    const newIdx = packages.length
    setPackages((prev) => [...prev, createDefaultTravelPackage(providerServiceType)])
    setEditingIndex(newIdx)
  }

  const handleEditClick = (index) => {
    // ensure packages is in sync with user object
    mapUserPackages()
    setEditingIndex(index)
  }

  const handleCancelEdit = (index) => {
    // if it's a blank new package, remove it
    if (isBlankPackage(packages[index])) {
      setPackages((current) => current.filter((_, i) => i !== index))
    }
    setEditingIndex(null)
    mapUserPackages()
  }

  // helper to refresh mapping if needed
  const refreshFromUser = () => {
    mapUserPackages()
  }

  const handleChange = (index, field, value) => {
    setPackages((current) => current.map((pkg, pkgIndex) => {
      if (pkgIndex !== index) return pkg
      if (field.startsWith('price.')) {
        const priceField = field.split('.')[1]
        return {
          ...pkg,
          price: {
            ...pkg.price,
            [priceField]: value
          }
        }
      }

      if (field === 'images') {
        return {
          ...pkg,
          images: value
        }
      }

      if (field === 'foodImages') {
        return {
          ...pkg,
          foodImages: value
        }
      }

      if (field.startsWith('details.')) {
        const [, section, key] = field.split('.')
        return {
          ...pkg,
          details: {
            ...(pkg.details || {}),
            [section]: {
              ...((pkg.details || {})[section] || {}),
              [key]: value
            }
          }
        }
      }

      return {
        ...pkg,
        [field]: value
      }
    }))
  }

  const handlePackageImageSelect = async (index, event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    try {
      setUploadingPackageImageIndex(index)
      const uploadedImages = []

      for (const file of files) {
        const url = await uploadPackageImage(file)
        if (url) {
          uploadedImages.push({ url, label: file.name })
        }
      }

      if (uploadedImages.length > 0) {
        setPackages((current) => current.map((pkg, pkgIndex) => {
          if (pkgIndex !== index) return pkg
          return {
            ...pkg,
            images: [...(pkg.images || []), ...uploadedImages]
          }
        }))
      }

      event.target.value = ''
    } catch (error) {
      console.error('Package image upload error:', error)
      toast.error(error.response?.data?.message || 'Failed to upload package image')
    } finally {
      setUploadingPackageImageIndex(null)
    }
  }

  const handlePackageFoodImageSelect = async (index, event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    try {
      setUploadingFoodImageIndex(index)
      const uploadedImages = []

      for (const file of files) {
        const url = await uploadPackageImage(file)
        if (url) {
          uploadedImages.push({ url, label: file.name, type: 'food' })
        }
      }

      if (uploadedImages.length > 0) {
        setPackages((current) => current.map((pkg, pkgIndex) => {
          if (pkgIndex !== index) return pkg
          return {
            ...pkg,
            foodImages: [...(pkg.foodImages || []), ...uploadedImages]
          }
        }))
      }

      event.target.value = ''
    } catch (error) {
      console.error('Food image upload error:', error)
      toast.error(error.response?.data?.message || 'Failed to upload food image')
    } finally {
      setUploadingFoodImageIndex(null)
    }
  }

  const removePackageImage = (packageIndex, imageIndex) => {
    setPackages((current) => current.map((pkg, pkgIdx) => {
      if (pkgIdx !== packageIndex) return pkg
      return {
        ...pkg,
        images: (pkg.images || []).filter((_, currentImageIndex) => currentImageIndex !== imageIndex)
      }
    }))
  }

  const removePackageFoodImage = (packageIndex, imageIndex) => {
    setPackages((current) => current.map((pkg, pkgIdx) => {
      if (pkgIdx !== packageIndex) return pkg
      return {
        ...pkg,
        foodImages: (pkg.foodImages || []).filter((_, currentImageIndex) => currentImageIndex !== imageIndex)
      }
    }))
  }

  const addPackage = () => setPackages((current) => [...current, createDefaultTravelPackage(providerServiceType)])

  const removePackage = (index) => setPackages((current) => current.filter((_, pkgIndex) => pkgIndex !== index))

  const savePackages = async () => {
    try {
      setSaving(true)
      const travelPackages = normalizeTravelPackages(packages, providerServiceType)
      const payload = {
        businessInfo: {
          ...(user?.businessInfo || {}),
          serviceType: providerServiceType,
          travelPackages
        }
      }

      const res = await authAPI.updateProfile(payload)
      updateUser(res.data.data.user)
      toast.success('Travel packages saved')
      // close editor after successful save
      setEditingIndex(null)
      // refresh local mapping from updated user
      mapUserPackages()
    } catch (error) {
      console.error('Save packages error:', error)
      toast.error(error.response?.data?.message || 'Failed to save travel packages')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Travel Packages</h1>
        <p className="text-slate-600 mt-1">Add package offers with districts, prices, and service-specific details.</p>
        <div className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          {providerPackageLabels[providerServiceType] || providerServiceType} provider
        </div>
      </div>

      <div className="space-y-4">
        {editingIndex === null ? (
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">Saved packages: {(user?.businessInfo?.travelPackages || []).length}</div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={refreshFromUser} className="text-sm text-primary underline">Refresh</button>
                <button type="button" onClick={handleAddPackageClick} className="btn btn-primary">Add package</button>
              </div>
            </div>

            {(user?.businessInfo?.travelPackages || []).length === 0 ? (
              <div className="rounded-xl border bg-white p-6 shadow-sm text-sm text-gray-600">No packages found. Click "Add package" to create your first package.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(user.businessInfo.travelPackages || []).map((p, i) => (
                  <div key={i} className="rounded-xl border bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{p.title || 'Untitled package'}</h3>
                        <p className="text-xs text-gray-500 mt-1">{p.duration || ''} • {Array.isArray(p.includedDistricts) ? p.includedDistricts.join(', ') : String(p.includedDistricts || '')}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">from</div>
                        <div className="text-lg font-bold text-gray-800">{p.price?.amount ? `$${p.price.amount}` : '-'}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => handleEditClick(i)} className="btn btn-secondary">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // render only the editing package form
          packages.map((pkg, index) => (
            editingIndex === index ? (
              <div key={index} className="bg-white rounded-3xl border shadow-sm p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h2 className="text-lg font-semibold text-slate-900">Package {index + 1}</h2>
                  <div className="flex items-center gap-2">
                    {packages.length > 1 && (
                      <button type="button" onClick={() => removePackage(index)} className="text-sm font-medium text-rose-600 hover:text-rose-700">
                        Remove
                      </button>
                    )}
                    <button type="button" onClick={() => handleCancelEdit(index)} className="text-sm text-slate-600">Cancel</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block text-sm font-semibold text-slate-700 mb-2">Package title</span>
                    <input value={pkg.title} onChange={(e) => handleChange(index, 'title', e.target.value)} className="input w-full" placeholder="Kandy to Ella explorer" />
                  </label>
                  <label className="block">
                    <span className="block text-sm font-semibold text-slate-700 mb-2">Duration</span>
                    <select value={pkg.duration} onChange={(e) => handleChange(index, 'duration', e.target.value)} className="input w-full">
                      <option value="">Select duration</option>
                      <option value="1 day">1 day</option>
                      <option value="2 days">2 days</option>
                      <option value="3 days">3 days</option>
                      <option value="4 days">4 days</option>
                      <option value="5 days">5 days</option>
                      <option value="7 days">7 days</option>
                      <option value="10 days">10 days</option>
                      <option value="14 days">14 days</option>
                    </select>
                  </label>
                </div>

                <div className="rounded-2xl border bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800 mb-2">
                    {providerPackageLabels[pkg.serviceType || providerServiceType] || 'Service details'}
                  </p>
                  {providerServiceType === 'hotel' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="block text-sm font-semibold text-slate-700 mb-2">Room count</span>
                        <input
                          type="number"
                          min="0"
                          value={pkg.details?.hotel?.roomCount || ''}
                          onChange={(e) => handleChange(index, 'details.hotel.roomCount', e.target.value)}
                          className="input w-full"
                          placeholder="12"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-sm font-semibold text-slate-700 mb-2">Room types</span>
                        <input
                          value={pkg.details?.hotel?.roomTypes || ''}
                          onChange={(e) => handleChange(index, 'details.hotel.roomTypes', e.target.value)}
                          className="input w-full"
                          placeholder="Single, double, family, suite"
                        />
                      </label>
                      <label className="block md:col-span-2">
                        <span className="block text-sm font-semibold text-slate-700 mb-2">Meal plan</span>
                        <input
                          value={pkg.details?.hotel?.mealPlan || ''}
                          onChange={(e) => handleChange(index, 'details.hotel.mealPlan', e.target.value)}
                          className="input w-full"
                          placeholder="Breakfast only, half board, full board"
                        />
                      </label>
                      <label className="block md:col-span-2">
                        <span className="block text-sm font-semibold text-slate-700 mb-2">Hotel amenities</span>
                        <input
                          value={pkg.details?.hotel?.amenities || ''}
                          onChange={(e) => handleChange(index, 'details.hotel.amenities', e.target.value)}
                          className="input w-full"
                          placeholder="Wi-Fi, pool, parking, spa"
                        />
                      </label>
                    </div>
                  )}

                  {providerServiceType === 'vehicle' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="block text-sm font-semibold text-slate-700 mb-2">Vehicle types</span>
                        <input
                          value={pkg.details?.vehicle?.vehicleTypes || ''}
                          onChange={(e) => handleChange(index, 'details.vehicle.vehicleTypes', e.target.value)}
                          className="input w-full"
                          placeholder="Car, van, minibus, SUV"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-sm font-semibold text-slate-700 mb-2">Capacity</span>
                        <input
                          type="number"
                          min="1"
                          value={pkg.details?.vehicle?.capacity || ''}
                          onChange={(e) => handleChange(index, 'details.vehicle.capacity', e.target.value)}
                          className="input w-full"
                          placeholder="4"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-sm font-semibold text-slate-700 mb-2">Driver included</span>
                        <select
                          value={String(pkg.details?.vehicle?.driverIncluded ?? true)}
                          onChange={(e) => handleChange(index, 'details.vehicle.driverIncluded', e.target.value === 'true')}
                          className="input w-full"
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="block text-sm font-semibold text-slate-700 mb-2">Air conditioned</span>
                        <select
                          value={String(pkg.details?.vehicle?.airConditioned ?? true)}
                          onChange={(e) => handleChange(index, 'details.vehicle.airConditioned', e.target.value === 'true')}
                          className="input w-full"
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </label>
                    </div>
                  )}
                </div>

                <label className="block">
                  <span className="block text-sm font-semibold text-slate-700 mb-2">Included districts</span>
                  <select
                    multiple
                    value={Array.isArray(pkg.includedDistricts) ? pkg.includedDistricts : []}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions || []).map((o) => o.value)
                      handleChange(index, 'includedDistricts', values)
                    }}
                    className="input w-full h-36"
                  >
                    {sriLankaDistricts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="block text-sm font-semibold text-slate-700 mb-2">Description</span>
                  <textarea value={pkg.description} onChange={(e) => handleChange(index, 'description', e.target.value)} rows={3} className="input w-full" placeholder="What is included in this package?" />
                </label>

                <label className="block">
                  <span className="block text-sm font-semibold text-slate-700 mb-2">Highlights</span>
                  <input value={pkg.highlights} onChange={(e) => handleChange(index, 'highlights', e.target.value)} className="input w-full" placeholder="Private transport, breakfast, guide included" />
                </label>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className="block text-sm font-semibold text-slate-700">Package images</span>
                    <span className="text-xs text-slate-500">Upload photos for this package</span>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handlePackageImageSelect(index, e)}
                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-700"
                    disabled={uploadingPackageImageIndex === index}
                  />

                  {uploadingPackageImageIndex === index && (
                    <p className="text-xs text-slate-500">Uploading package images...</p>
                  )}

                  {Array.isArray(pkg.images) && pkg.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {pkg.images.map((image, imageIndex) => (
                        <figure key={`${image.url}-${imageIndex}`} className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
                          <img src={image.url} alt={image.label || `Package image ${imageIndex + 1}`} className="h-28 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePackageImage(index, imageIndex)}
                            className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-rose-600 shadow"
                          >
                            Remove
                          </button>
                          {image.label && <figcaption className="px-3 py-2 text-xs text-slate-600 bg-white border-t truncate">{image.label}</figcaption>}
                        </figure>
                      ))}
                    </div>
                  )}
                </div>

                {providerServiceType === 'hotel' && (
                  <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <span className="block text-sm font-semibold text-slate-700">Food images</span>
                      <span className="text-xs text-slate-500">Add meal, buffet, and restaurant photos</span>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handlePackageFoodImageSelect(index, e)}
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-amber-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-amber-500"
                      disabled={uploadingFoodImageIndex === index}
                    />

                    {uploadingFoodImageIndex === index && (
                      <p className="text-xs text-slate-500">Uploading food images...</p>
                    )}

                    {Array.isArray(pkg.foodImages) && pkg.foodImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {pkg.foodImages.map((image, imageIndex) => (
                          <figure key={`${image.url}-${imageIndex}`} className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
                            <img src={image.url} alt={image.label || `Food image ${imageIndex + 1}`} className="h-28 w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removePackageFoodImage(index, imageIndex)}
                              className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-rose-600 shadow"
                            >
                              Remove
                            </button>
                            {image.label && <figcaption className="px-3 py-2 text-xs text-slate-600 bg-white border-t truncate">{image.label}</figcaption>}
                          </figure>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-[1fr_160px] gap-4">
                  <label className="block">
                    <span className="block text-sm font-semibold text-slate-700 mb-2">Price amount</span>
                    <input type="number" min="0" value={pkg.price?.amount} onChange={(e) => handleChange(index, 'price.amount', e.target.value)} className="input w-full" placeholder="250" />
                  </label>
                  <label className="block">
                    <span className="block text-sm font-semibold text-slate-700 mb-2">Currency</span>
                    <select value={pkg.price?.currency || 'USD'} onChange={(e) => handleChange(index, 'price.currency', e.target.value)} className="input w-full">
                      <option value="USD">USD</option>
                      <option value="LKR">LKR</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </label>
                </div>
              </div>
            ) : null
          ))
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={handleAddPackageClick} className="btn btn-secondary">
          Add another package
        </button>
        <button type="button" onClick={savePackages} disabled={saving} className="btn btn-primary">
          {saving ? 'Saving...' : 'Save packages'}
        </button>
      </div>
    </div>
  )
}

export default ProviderPackagesPage