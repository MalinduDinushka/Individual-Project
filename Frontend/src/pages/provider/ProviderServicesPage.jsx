import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const ProviderServicesPage = () => {
  const user = useAuthStore((state) => state.user)
  const packages = useMemo(() => user?.businessInfo?.travelPackages || [], [user])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
          <p className="text-gray-600 mt-1">Manage your service packages and published offerings.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/provider/packages" className="btn btn-primary">
            Manage packages
          </Link>
          <Link to="/provider/bookings" className="btn btn-secondary">
            View bookings
          </Link>
        </div>
      </div>

      {packages.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
          No service packages found yet. Create your first package to start receiving bookings.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {packages.map((service, index) => (
            <div key={index} className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{service.title || 'Untitled package'}</h2>
                  <p className="text-sm text-gray-500 mt-1">{service.serviceType ? service.serviceType.replace(/^[a-z]/, (c) => c.toUpperCase()) : 'Service'}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">From</div>
                  <div className="text-2xl font-bold text-gray-900">{service.price?.amount ? `$${service.price.amount}` : '—'}</div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{service.description || 'No description provided.'}</p>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                <div>
                  <div className="font-medium text-gray-800">Duration</div>
                  <div>{service.duration || 'Not set'}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Destinations</div>
                  <div>{(service.includedDistricts || []).join(', ') || 'Any'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProviderServicesPage
