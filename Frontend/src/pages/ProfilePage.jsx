import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { authAPI } from '../api'
import { useAuthStore } from '../store/authStore'

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

const formatList = (value) => {
  if (!value) return ''
  if (Array.isArray(value)) return value.filter(Boolean).join(', ')
  return String(value)
}

const formatValidationField = (field) => {
  if (!field) return 'Profile'

  return String(field)
    .replace(/^businessInfo\./, 'business info ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[._]/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase())
}

const providerServiceOptions = [
  { value: 'guide', label: 'Guide' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'hotel', label: 'Hotel / Guest house' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'other', label: 'Other' }
]

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    gender: '',
    languages: '',
    businessInfo: {
      businessName: '',
      serviceType: '',
      description: '',
      location: ''
    }
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])

  const groupedPhotos = useMemo(() => groupPhotosByCategory(user?.photos || []), [user?.photos])
  const isProvider = user?.role === 'provider'
  const nationalityLabel = user?.nationality ? (user.nationality === 'local' ? 'Local' : 'Foreign') : '—'
  const idLabel = user?.nationality === 'foreign' ? 'Passport' : 'NIC'
  const idValue = user?.nationality === 'foreign' ? user?.passport : user?.nic

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        gender: user.gender || '',
        languages: formatList(user.languages),
        businessInfo: {
          businessName: user.businessInfo?.businessName || '',
          serviceType: user.businessInfo?.serviceType || '',
          description: user.businessInfo?.description || '',
          location: user.businessInfo?.location || ''
        }
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (validationErrors.length > 0) setValidationErrors([])

    if (name.startsWith('businessInfo.')) {
      const key = name.split('.')[1]
      setForm((f) => ({ ...f, businessInfo: { ...f.businessInfo, [key]: value } }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
  }

  const handleAvatar = (e) => {
    const file = e.target.files[0]
    if (file) setAvatarFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleUploadAvatar = async () => {
    if (!avatarFile) return
    try {
      setUploading(true)
      const res = await authAPI.uploadAvatar(avatarFile)
      // backend may return either { data: { user } } or { data: { avatar } }
      const updatedUser = res.data?.data?.user
      const avatarOnly = res.data?.data?.avatar
      if (updatedUser) {
        updateUser(updatedUser)
      } else if (avatarOnly) {
        updateUser({ avatar: avatarOnly })
      }
      toast.success('Avatar updated')
      setAvatarFile(null)
      setPreviewUrl(null)
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      languages: formatList(user?.languages),
      businessInfo: {
        businessName: user?.businessInfo?.businessName || '',
        serviceType: user?.businessInfo?.serviceType || '',
        description: user?.businessInfo?.description || '',
        location: user?.businessInfo?.location || ''
      }
    })
    setValidationErrors([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setValidationErrors([])

      const payload = {
        name: form.name,
        phone: form.phone,
        gender: form.gender,
        languages: form.languages
      }

      if (isProvider) {
        payload.businessInfo = {
          businessName: form.businessInfo.businessName,
          serviceType: form.businessInfo.serviceType,
          description: form.businessInfo.description,
          location: form.businessInfo.location
        }
      }

      const res = await authAPI.updateProfile(payload)
      const updated = res.data.data.user
      updateUser(updated)
      setIsEditing(false)
      toast.success('Profile updated')
    } catch (error) {
      console.error('Update profile error:', error)
      const backendErrors = error.response?.data?.errors
      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        setValidationErrors(backendErrors)
      }
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const renderField = (label, value) => (
    <div className="rounded-xl border bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900 break-words">{value || '—'}</p>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Profile</h2>
            <p className="text-sm text-gray-500">View the details you registered with, then edit the fields you need.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (isEditing) {
                resetForm()
                setIsEditing(false)
              } else {
                setIsEditing(true)
              }
            }}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            {isEditing ? 'Cancel editing' : 'Edit details'}
          </button>
        </div>

        {validationErrors.length > 0 && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Please fix the following errors:</p>
            <ul className="mt-2 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={`${error.field || 'error'}-${index}`}>
                  {error.field ? `${formatValidationField(error.field)}: ` : ''}{error.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <img src={previewUrl || user?.avatar} alt={user?.name} className="w-24 h-24 rounded-2xl object-cover border" />
            <div className="min-w-0">
              <p className="text-sm text-gray-500">Profile photo</p>
              <p className="font-semibold text-gray-900 truncate">{user?.name || 'Your account'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'user'}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-gray-700">Change photo</label>
            <input type="file" accept="image/*" onChange={handleAvatar} className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200" />
            {avatarFile && (
              <div className="flex items-center gap-2">
                <button onClick={handleUploadAvatar} disabled={uploading} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button onClick={() => setAvatarFile(null)} className="rounded-xl border px-4 py-2 text-sm font-semibold text-gray-700">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Registration details</h3>
                <p className="text-sm text-gray-500">The information saved when you registered.</p>
              </div>
              {!isEditing && (
                <button type="button" onClick={() => setIsEditing(true)} className="text-sm font-semibold text-primary hover:underline">
                  View / edit
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {renderField('Full name', user?.name)}
                {renderField('Email', user?.email)}
                {renderField('Phone', user?.phone)}
                {renderField('Gender', user?.gender)}
                {renderField('Languages', formatList(user?.languages))}
                {renderField('Role', user?.role)}
                {renderField('Nationality', nationalityLabel)}
                {renderField(idLabel, idValue)}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full name</label>
                    <input name="name" value={form.name} onChange={handleChange} className="input w-full mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange} className="input w-full mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select name="gender" value={form.gender || ''} onChange={handleChange} className="input w-full mt-1">
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Languages</label>
                    <input
                      name="languages"
                      value={form.languages}
                      onChange={handleChange}
                      placeholder="English, Sinhala, Tamil"
                      className="input w-full mt-1"
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input value={user?.email || ''} disabled className="input w-full mt-1 bg-gray-100 text-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{idLabel}</label>
                    <input value={idValue || ''} disabled className="input w-full mt-1 bg-gray-100 text-gray-500" />
                  </div>
                </div>

                {isProvider && (
                  <div className="rounded-2xl border bg-gray-50 p-5 space-y-5">
                    <div>
                      <h4 className="font-semibold text-gray-900">Business details</h4>
                      <p className="text-sm text-gray-500">Update the provider information you entered during registration.</p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Business name</label>
                        <input name="businessInfo.businessName" value={form.businessInfo.businessName} onChange={handleChange} className="input w-full mt-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Service type</label>
                        <select name="businessInfo.serviceType" value={form.businessInfo.serviceType} onChange={handleChange} className="input w-full mt-1">
                          <option value="">Select service type</option>
                          {providerServiceOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="businessInfo.description" value={form.businessInfo.description} onChange={handleChange} rows="4" className="input w-full mt-1" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input name="businessInfo.location" value={form.businessInfo.location} onChange={handleChange} className="input w-full mt-1" />
                      </div>
                    </div>

                    {form.businessInfo.location && (
                      <div className="rounded-xl border overflow-hidden bg-white">
                        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b bg-white">
                          <div>
                            <p className="font-medium text-gray-800">Map preview</p>
                            <p className="text-xs text-gray-500">Preview from your saved business location</p>
                          </div>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(form.businessInfo.location)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            Open in Google Maps
                          </a>
                        </div>
                        <iframe
                          title="Business location preview"
                          src={buildGoogleMapsEmbedUrl(form.businessInfo.location)}
                          className="h-64 w-full"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button type="submit" disabled={saving} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm()
                      setIsEditing(false)
                    }}
                    className="rounded-xl border px-5 py-2.5 text-sm font-semibold text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {isProvider && (
            <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Business photos</h3>
                  <p className="text-sm text-gray-500">Uploaded images grouped by category.</p>
                </div>
                <span className="text-sm text-gray-500">{(user.photos || []).length} uploaded</span>
              </div>

              {Object.keys(groupedPhotos).length === 0 ? (
                <div className="text-sm text-gray-600 bg-gray-50 border rounded-xl p-4">
                  No business photos uploaded yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedPhotos).map(([category, photos]) => (
                    <div key={category}>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <h4 className="text-sm font-semibold text-gray-800">{photoCategoryLabels[category] || category}</h4>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">{photos.length} item{photos.length === 1 ? '' : 's'}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {photos.map((photo) => (
                          <div key={photo._id || photo.url} className="rounded-xl overflow-hidden border bg-white">
                            <img src={photo.url} alt={photo.caption || category} className="w-full h-36 object-cover" />
                            {photo.caption && <div className="px-3 py-2 text-xs text-gray-600">{photo.caption}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
