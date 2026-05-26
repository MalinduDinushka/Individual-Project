import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { authAPI } from '../api'
import { useAuthStore } from '../store/authStore'

const buildGoogleMapsEmbedUrl = (location) => {
  const query = String(location || '').trim()
  if (!query) return ''
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
}

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState({ name: '', phone: '', gender: '', businessInfo: {} })
  const [avatarFile, setAvatarFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        gender: user.gender || '',
        businessInfo: user.businessInfo || {}
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await authAPI.updateProfile(form)
      const updated = res.data.data.user
      updateUser(updated)
      toast.success('Profile updated')
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Profile</h2>

      <div className="flex items-center gap-6 mb-6">
        <img src={previewUrl || user?.avatar} alt={user?.name} className="w-24 h-24 rounded-full object-cover" />
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Change Photo</label>
          <input type="file" accept="image/*" onChange={handleAvatar} />
          {avatarFile && (
            <div className="mt-2 flex items-center gap-2">
              <button onClick={handleUploadAvatar} disabled={uploading} className="btn btn-primary">
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button onClick={() => setAvatarFile(null)} className="btn">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full name</label>
          <input name="name" value={form.name} onChange={handleChange} className="input w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="input w-full" />
        </div>

        {user?.role === 'provider' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select name="gender" value={form.gender || ''} onChange={handleChange} className="input w-full">
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        )}

        {user?.role === 'provider' && (
          <>
            <h3 className="font-medium">Business Info</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Name</label>
              <input name="businessInfo.businessName" value={form.businessInfo.businessName || ''} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Service Type</label>
              <input name="businessInfo.serviceType" value={form.businessInfo.serviceType || ''} onChange={handleChange} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input name="businessInfo.location" value={form.businessInfo.location || ''} onChange={handleChange} className="input w-full" />
            </div>

            {form.businessInfo.location && (
              <div className="rounded-xl border overflow-hidden bg-gray-50">
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
          </>
        )}

        <div className="pt-4">
          <button type="submit" className="btn btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  )
}

export default ProfilePage
