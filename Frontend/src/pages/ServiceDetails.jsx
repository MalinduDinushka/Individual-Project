import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { serviceAPI, bookingAPI } from '../api'
import { toast } from 'react-hot-toast'

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
    console.log('ServiceDetails mounted id=', id, 'location=', location.pathname)
  }, [id])

  const fetchService = async () => {
    try {
      setLoading(true)
      const res = await serviceAPI.getServiceById(id)
      setService(res.data.data.service)
    } catch (err) {
      console.error('Fetch service error:', err)
      // Show a visible fallback for the current page rather than redirecting away
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
      toast.success('Booking created — check My Trips')
      navigate('/tourist/trips')
    } catch (err) {
      toast.dismiss()
      console.error('Booking error:', err)
      toast.error(err?.response?.data?.message || 'Failed to create booking')
    }
  }

  if (loading) return <div>Loading...</div>
  if (!service) return (
    <div>
      <h3 className="text-lg font-semibold">Service not found</h3>
      <div className="text-sm text-gray-500">Requested path: {location.pathname}</div>
      <div className="text-sm text-gray-500">Requested id: {id}</div>
      <div className="text-sm text-red-500">Open console to see errors.</div>
      <button onClick={() => navigate('/tourist')} className="btn btn-primary mt-4">Back to Dashboard</button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        <img src={service.images?.[0] || '/placeholder.png'} alt={service.name} className="w-96 h-60 object-cover rounded" />
        <div>
          <h1 className="text-2xl font-bold">{service.name}</h1>
          <p className="text-gray-600 mt-2">{service.description}</p>
          <div className="mt-4">
            <div className="text-lg font-semibold">{service.pricing?.currency || '$'}{service.pricing?.amount} / {service.pricing?.unit}</div>
            <div className="text-sm text-gray-500">Type: {service.type}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow w-96">
        <h3 className="font-semibold mb-2">Book this service</h3>
        <label className="block text-sm text-gray-600">Start Date</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full mb-2 input" />
        <label className="block text-sm text-gray-600">End Date</label>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full mb-2 input" />
        <label className="block text-sm text-gray-600">People</label>
        <input type="number" min={1} value={people} onChange={e => setPeople(Number(e.target.value))} className="w-full mb-3 input" />
        <button onClick={handleBook} className="btn btn-primary w-full">Book Now</button>
      </div>
    </div>
  )
}

export default ServiceDetails
