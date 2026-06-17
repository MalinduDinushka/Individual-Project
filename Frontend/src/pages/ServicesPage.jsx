import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import VerifiedBadge from '../components/VerifiedBadge'
import { serviceAPI } from '../api'
import { FaMapMarkerAlt, FaSearch, FaSlidersH, FaStar } from 'react-icons/fa'

const fallbackServices = [
  {
    id: 1,
    name: 'Beachfront Villa - Mirissa',
    type: 'Villa',
    description: 'A beautiful beachfront villa with private pool and sea views.',
    price: 120,
    unit: 'night',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500'
  },
  {
    id: 2,
    name: 'Luxury Safari Experience',
    type: 'Safari Jeep',
    description: 'Guided jeep safari through the national park with expert naturalists.',
    price: 85,
    unit: 'day',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=500'
  },
  {
    id: 3,
    name: 'Cultural Heritage Tour',
    type: 'Tour Guide',
    description: 'Explore UNESCO heritage sites with an experienced local guide.',
    price: 60,
    unit: 'day',
    image: '/cultural-heritage.webp'
  }
]

const ServicesPage = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const res = await serviceAPI.getAllServices({ limit: 20 })
      const fetchedServices = res?.data?.data?.services || []
      setServices(fetchedServices.length ? fetchedServices : fallbackServices)
    } catch (error) {
      setServices(fallbackServices)
    } finally {
      setLoading(false)
    }
  }

  const serviceTypes = useMemo(() => {
    const types = services
      .map((service) => service.type)
      .filter(Boolean)
      .map((type) => String(type))
    return ['all', ...Array.from(new Set(types))]
  }, [services])

  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return services.filter((service) => {
      const type = String(service.type || '')
      const matchesType = typeFilter === 'all' || type === typeFilter
      const searchable = [
        service.name,
        service.type,
        service.description,
        service.location,
        service.businessName
      ].filter(Boolean).join(' ').toLowerCase()

      return matchesType && (!normalizedQuery || searchable.includes(normalizedQuery))
    })
  }, [query, services, typeFilter])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar variant="light" />
      <section className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-end">
            <div>
              <span className="section-eyebrow">Services</span>
              <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950">
                Find trusted travel services
              </h1>
              <p className="mt-4 section-copy max-w-2xl">
                Browse stays, guides, transport, safari experiences, and local support with clear pricing and booking details.
              </p>
            </div>

            <div className="premium-panel p-4">
              <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                <FaSlidersH className="text-primary" />
                <span className="font-semibold text-slate-700">Refine results</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_150px] gap-3">
                <label className="relative block">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="input pl-11"
                    placeholder="Search by place, service, or provider"
                  />
                </label>
                <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="input">
                  {serviceTypes.map((type) => (
                    <option key={type} value={type}>{type === 'all' ? 'All types' : type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="premium-panel overflow-hidden animate-pulse">
                <div className="h-56 bg-slate-200" />
                <div className="p-6 space-y-4">
                  <div className="h-5 bg-slate-200 rounded" />
                  <div className="h-4 bg-slate-200 rounded w-4/5" />
                  <div className="h-10 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="premium-panel p-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900">No matching services</h2>
            <p className="mt-2 text-slate-500">Try a different keyword or service type.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const serviceId = service._id || service.id
              const image = service.images?.[0]?.url || service.image || '/placeholder.png'
              const price = service.pricing?.amount ?? service.price
              const unit = service.pricing?.unit ?? service.unit
              const description = service.description || 'Explore this service and book in minutes.'
              const location = service.location || service.address || 'Sri Lanka'
              const rating = service.rating || service.averageRating || 4.8

              return (
                <article key={serviceId} className="premium-panel overflow-hidden group">
                  <div className="relative h-56 bg-slate-200 overflow-hidden">
                    <img src={image} alt={service.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute left-4 top-4 flex items-center gap-2">
                      <span className="badge bg-white/95 text-primary shadow-sm">{service.type || 'Service'}</span>
                      <span className="badge bg-slate-950/80 text-white inline-flex items-center gap-1">
                        <FaStar className="text-amber-300" />
                        {Number(rating).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-950 leading-snug">{service.name}</h3>
                      <div className="mt-2 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <FaMapMarkerAlt className="text-primary" />
                          <span>{location}</span>
                        </div>
                        {service.provider && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <span className="text-primary">Provider:</span>
                            <span>{service.provider.businessInfo?.businessName || service.provider.name}</span>
                            <VerifiedBadge isVerified={service.provider.isVerified} verificationStatus={service.provider.verificationStatus} size="xs" />
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-6 line-clamp-3">{description}</p>
                    <div className="flex items-end justify-between gap-4 pt-2 border-t border-slate-100">
                      <div>
                        <div className="text-2xl font-extrabold text-primary">${price ?? '—'}</div>
                        <div className="text-sm text-slate-500">per {unit || 'booking'}</div>
                      </div>
                      <Link to={`/service/${serviceId}`} className="btn btn-primary">
                        View details
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
      <Footer />
    </div>
  )
}

export default ServicesPage
