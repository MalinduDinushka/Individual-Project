import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FaCalendarAlt, FaCheckCircle, FaMapMarkerAlt, FaStar, FaUsers } from 'react-icons/fa'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import VerifiedBadge from '../components/VerifiedBadge'
import { serviceAPI, bookingAPI } from '../api'

const getServiceImage = (service) => {
  const firstImage = service?.images?.[0]
  if (typeof firstImage === 'string') return firstImage
  return firstImage?.url || service?.image || '/placeholder.png'
}

const ServiceDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [people, setPeople] = useState(1)

  useEffect(() => {
    fetchService()
  }, [id])

  const fetchService = async () => {
    try {
      setLoading(true)
      const res = await serviceAPI.getServiceById(id)
      setService(res.data.data.service)
    } catch (err) {
      console.error('Fetch service error:', err)
      toast.error(err?.response?.data?.message || 'Failed to load service')
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async () => {
    if (!startDate || !endDate) return toast.error('Please select dates')
    try {
      const loadingToastId = toast.loading('Creating booking...')
      const payload = {
        service: service._id || id,
        serviceDetails: service,
        bookingDate: { startDate, endDate },
        numberOfPeople: people
      }
      await bookingAPI.createBooking(payload)
      toast.dismiss(loadingToastId)
      toast.success('Booking created - check My Trips')
      navigate('/tourist/trips')
    } catch (err) {
      toast.dismiss()
      console.error('Booking error:', err)
      toast.error(err?.response?.data?.message || 'Failed to create booking')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar variant="light" />
        <main className="container mx-auto px-6 py-12">
          <div className="premium-panel p-8 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
              <div className="h-[420px] bg-slate-200 rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-slate-200 rounded" />
                <div className="h-24 bg-slate-200 rounded" />
                <div className="h-48 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar variant="light" />
        <main className="container mx-auto px-6 py-16">
          <div className="premium-panel p-10 text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900">Service not found</h3>
            <p className="mt-3 text-slate-500">We could not load the requested service at {location.pathname}.</p>
            <button onClick={() => navigate('/services')} className="btn btn-primary mt-6">Back to services</button>
          </div>
        </main>
      </div>
    )
  }

  const image = getServiceImage(service)
  const price = service.pricing?.amount ?? service.price
  const unit = service.pricing?.unit ?? service.unit ?? 'booking'
  const currency = service.pricing?.currency || '$'
  const locationLabel = service.location || service.address || 'Sri Lanka'
  const rating = service.rating || service.averageRating || 4.8

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar variant="light" />
      <main className="container mx-auto px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-8 items-start">
          <section className="space-y-6">
            <div className="premium-panel overflow-hidden">
              <div className="relative h-[300px] md:h-[460px] bg-slate-200">
                <img src={image} alt={service.name} className="w-full h-full object-cover" />
                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                  <span className="badge bg-white/95 text-primary shadow-sm">{service.type || 'Service'}</span>
                  <span className="badge bg-slate-950/85 text-white inline-flex items-center gap-1 shadow-sm">
                    <FaStar className="text-amber-300" />
                    {Number(rating).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="premium-panel p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950">{service.name}</h1>
                  <div className="mt-3 flex items-center gap-2 text-slate-500">
                    <FaMapMarkerAlt className="text-primary" />
                    <span>{locationLabel}</span>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-3xl font-extrabold text-primary">{currency}{price ?? '-'}</div>
                  <div className="text-sm text-slate-500">per {unit}</div>
                </div>
              </div>

              <p className="mt-6 text-slate-600 leading-8">
                {service.description || 'Explore this service and book directly through TourMate.'}
              </p>

              {service.provider && (
                <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm text-slate-600 mb-1">
                    <span className="font-semibold text-slate-900">Service Provider:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <VerifiedBadge isVerified={service.provider.isVerified} verificationStatus={service.provider.verificationStatus} size="sm" />
                    <span className="text-slate-900 font-semibold">
                      {service.provider.businessInfo?.businessName || service.provider.name}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['Verified provider', 'Clear booking dates', 'Support available'].map((item) => (
                  <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-4 flex items-center gap-3">
                    <FaCheckCircle className="text-emerald-600" />
                    <span className="text-sm font-semibold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="premium-panel p-6 md:p-7 lg:sticky lg:top-24">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-950">Book this service</h2>
                <p className="mt-1 text-sm text-slate-500">Choose dates and traveler count.</p>
              </div>
              <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <FaCalendarAlt />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="block text-sm font-semibold text-slate-700 mb-2">Start date</span>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input" />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-slate-700 mb-2">End date</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input" />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-slate-700 mb-2">People</span>
                <div className="relative">
                  <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="number" min={1} value={people} onChange={e => setPeople(Number(e.target.value))} className="input pl-11" />
                </div>
              </label>
              <button onClick={handleBook} className="btn btn-primary w-full">Book now</button>
            </div>

            <div className="mt-6 rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600 leading-6">
              Booking requests are saved to your account so you can manage trip details from the tourist dashboard.
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ServiceDetails
