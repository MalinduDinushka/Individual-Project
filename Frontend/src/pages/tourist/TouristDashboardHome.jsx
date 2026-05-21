import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlus, FaStar, FaCalendar, FaMapMarkerAlt } from 'react-icons/fa'
import { useAuthStore } from '../../store/authStore'
import { tourAPI, serviceAPI } from '../../api'
import { toast } from 'react-hot-toast'

const TouristDashboardHome = () => {
  const user = useAuthStore(state => state.user)
  const [activeTrip, setActiveTrip] = useState(null)
  const [recommendedServices, setRecommendedServices] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Fetch active trips and recommended services
      const [tripsRes, servicesRes] = await Promise.all([
        tourAPI.getMyRequests(),
        serviceAPI.getAllServices({ limit: 3 })
      ])

      // Get first active trip
      const activeTripData = tripsRes.data.data.tourRequests.find(
        t => t.status === 'in-progress' || t.status === 'confirmed'
      )
      setActiveTrip(activeTripData)

      setRecommendedServices([
        {
          id: 1,
          name: 'Beachfront Villa - Mirissa',
          type: 'Villa',
          rating: 4.9,
          price: 120,
          unit: 'night',
          image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500'
        },
        {
          id: 2,
          name: 'Luxury Safari Experience',
          type: 'Safari Jeep',
          rating: 4.8,
          price: 85,
          unit: 'day',
          image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=500'
        },
        {
          id: 3,
          name: 'Cultural Heritage Tour',
          type: 'Tour Guide',
          rating: 5.0,
          price: 60,
          unit: 'day',
          image: '/cultural-heritage.webp'
        }
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const openServiceDetails = (serviceId) => {
    navigate(`/service/${serviceId}`)
  }

  const openTourRequestForm = () => {
    navigate('/tourist/requests/new')
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome Back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600 mt-1">Ready for your next adventure?</p>
      </div>

      {/* Active Trip Card */}
      {activeTrip ? (
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-white/80 mb-1">Active Trip</div>
              <h2 className="text-2xl font-bold">{activeTrip.title || 'Sigiriya & Dambulla'}</h2>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <span className="font-semibold">Confirmed</span>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm mb-6">
            <div className="flex items-center space-x-2">
              <FaCalendar />
              <span>Jan 25-28, 2026</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaMapMarkerAlt />
              <span>Guide: Rohan Fernando</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button className="flex-1 bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition">
              View Itinerary
            </button>
            <button className="flex-1 bg-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition">
              Contact Guide
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaPlus className="text-primary text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Post a Tour Request</h3>
          <p className="text-gray-600 mb-6">
            Share your dream itinerary and receive custom offers from verified providers
          </p>
          <button onClick={openTourRequestForm} className="btn btn-primary">
            Create Tour Request
          </button>
        </div>
      )}

      {/* Recommended Services */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Recommended for You</h2>
          <button className="text-primary hover:underline font-medium">View All</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedServices.map(service => (
            <div
              key={service.id}
              role="button"
              tabIndex={0}
              onClick={() => openServiceDetails(service.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  openServiceDetails(service.id)
                }
              }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
            >
              <div className="relative h-48">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-semibold">
                  {service.type}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-2">{service.name}</h3>
                
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center space-x-1 text-secondary">
                    <FaStar className="text-sm" />
                    <span className="font-semibold">{service.rating}</span>
                  </div>
                  <span className="text-gray-400 text-sm">•</span>
                  <span className="text-gray-600 text-sm">127 reviews</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">${service.price}</span>
                    <span className="text-gray-500 text-sm">/{service.unit}</span>
                  </div>
                  <button type="button" onClick={() => openServiceDetails(service.id)} className="btn btn-primary text-sm px-4 py-2 inline-block text-center">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TouristDashboardHome
