import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { authAPI } from '../../api'
import { sriLankaDistricts } from '../../data/sriLankaTour'
import { useAuthStore } from '../../store/authStore'

const createDefaultTravelPackage = () => ({
  title: '',
  description: '',
  includedDistricts: [],
  duration: '',
  highlights: '',
  images: [],
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

  const normalizeTravelPackages = (travelPackages = []) => {
  return travelPackages
    .map((item) => {
      const title = String(item.title || '').trim()
      const description = String(item.description || '').trim()
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
      const amount = Number(item.price?.amount)
      const currency = String(item.price?.currency || 'USD').trim() || 'USD'

      if (!title && !description && includedDistricts.length === 0 && !Number.isFinite(amount) && !duration && highlights.length === 0 && images.length === 0) {
        return null
      }

      return {
        title,
        description,
        includedDistricts,
        duration,
        highlights,
        images,
        price: Number.isFinite(amount) ? { amount, currency } : undefined
      }
    })
    .filter(Boolean)
}

const ProviderPackagesPage = () => {
  const { user, updateUser } = useAuthStore()
  const [packages, setPackages] = useState([createDefaultTravelPackage()])
  const [saving, setSaving] = useState(false)
  const [uploadingPackageImageIndex, setUploadingPackageImageIndex] = useState(null)

  useEffect(() => {
    const existing = user?.businessInfo?.travelPackages?.length
      ? user.businessInfo.travelPackages.map((item) => ({
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
          price: {
            amount: item.price?.amount ?? '',
            currency: item.price?.currency || 'USD'
          }
        }))
      : [createDefaultTravelPackage()]

    setPackages(existing)
  }, [user])

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

  const removePackageImage = (packageIndex, imageIndex) => {
    setPackages((current) => current.map((pkg, pkgIdx) => {
      if (pkgIdx !== packageIndex) return pkg
      return {
        ...pkg,
        images: (pkg.images || []).filter((_, currentImageIndex) => currentImageIndex !== imageIndex)
      }
    }))
  }

  const addPackage = () => setPackages((current) => [...current, createDefaultTravelPackage()])

  const removePackage = (index) => setPackages((current) => current.filter((_, pkgIndex) => pkgIndex !== index))

  const savePackages = async () => {
    try {
      setSaving(true)
      const travelPackages = normalizeTravelPackages(packages)
      const payload = {
        businessInfo: {
          ...(user?.businessInfo || {}),
          travelPackages
        }
      }

      // Debug: print payload sent to server
      try {
        // Avoid logging very large payloads
        console.log('savePackages payload', JSON.stringify(payload).slice(0, 2000))
      } catch (e) {
        console.warn('Could not stringify savePackages payload', e)
      }

      const res = await authAPI.updateProfile(payload)
      updateUser(res.data.data.user)
      toast.success('Travel packages saved')
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
        <p className="text-slate-600 mt-1">Add package offers with districts and prices. Tourists will see matching ones when they plan a trip.</p>
      </div>

      <div className="space-y-4">
        {packages.map((pkg, index) => (
          <div key={index} className="bg-white rounded-3xl border shadow-sm p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-lg font-semibold text-slate-900">Package {index + 1}</h2>
              {packages.length > 1 && (
                <button type="button" onClick={() => removePackage(index)} className="text-sm font-medium text-rose-600 hover:text-rose-700">
                  Remove
                </button>
              )}
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
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={addPackage} className="btn btn-secondary">
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