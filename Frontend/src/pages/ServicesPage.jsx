import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { serviceAPI } from '../api'

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="light" />
      <section className="container mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Recommended Places</h1>
          <p className="text-gray-600 mt-2">Browse places and open details to book directly.</p>
        </div>

        {loading ? (
          <div className="text-gray-600">Loading services...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const serviceId = service._id || service.id
              const image = service.images?.[0]?.url || service.image || '/placeholder.png'
              const price = service.pricing?.amount ?? service.price
              const unit = service.pricing?.unit ?? service.unit
              const description = service.description || 'Explore this service and book in minutes.'

              return (
                <div key={serviceId} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                  <img src={image} alt={service.name} className="h-52 w-full object-cover" />
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">{service.type}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3">{description}</p>
                    <div className="flex items-end justify-between pt-2">
                      <div>
                        <div className="text-2xl font-bold text-primary">${price}</div>
                        <div className="text-sm text-gray-500">per {unit}</div>
                      </div>
                      <Link to={`/service/${serviceId}`} className="btn btn-primary">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
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
