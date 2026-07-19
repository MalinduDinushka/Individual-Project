import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const ProviderSettingsPage = () => {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Update your provider account details and business profile.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Info</h2>
          <p className="text-sm text-gray-600">Name</p>
          <p className="font-medium text-gray-900 mb-4">{user?.name || 'Not provided'}</p>

          <p className="text-sm text-gray-600">Email</p>
          <p className="font-medium text-gray-900 mb-4">{user?.email || 'Not provided'}</p>

          <p className="text-sm text-gray-600">Phone</p>
          <p className="font-medium text-gray-900">{user?.phone || 'Not provided'}</p>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Profile</h2>
          <p className="text-sm text-gray-600">Business name</p>
          <p className="font-medium text-gray-900 mb-4">{user?.businessInfo?.businessName || 'Not provided'}</p>

          <p className="text-sm text-gray-600">Service type</p>
          <p className="font-medium text-gray-900 mb-4">{user?.businessInfo?.serviceType || 'Not provided'}</p>

          <p className="text-sm text-gray-600">Location</p>
          <p className="font-medium text-gray-900">{user?.businessInfo?.location || 'Not provided'}</p>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
          <p className="text-sm text-gray-600 mb-6">Use the profile editor to change your contact details, business description, or service type.</p>
          <Link to="/provider/profile" className="btn btn-primary w-full text-center">
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProviderSettingsPage
