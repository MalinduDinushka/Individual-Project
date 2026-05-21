import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaMapMarkerAlt, FaRoute, FaUsers } from 'react-icons/fa'
import { tourAPI } from '../../api'
import { toast } from 'react-hot-toast'

const defaultForm = {
  title: '',
  destinationsText: '',
  startDate: '',
  endDate: '',
  travelers: 1,
  budgetMin: '',
  budgetMax: '',
  budgetCurrency: 'USD',
  accommodation: '',
  transportation: '',
  activitiesText: '',
  dietary: '',
  specialRequirements: ''
}

const TourRequestCreate = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState(defaultForm)
  const [submitting, setSubmitting] = useState(false)

  const stayLength = useMemo(() => {
    if (!form.startDate || !form.endDate) return null
    const start = new Date(form.startDate)
    const end = new Date(form.endDate)
    const diffDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
    return diffDays
  }, [form.startDate, form.endDate])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const destinations = form.destinationsText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    const activities = form.activitiesText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    if (!form.title.trim() || destinations.length === 0 || !form.startDate || !form.endDate) {
      toast.error('Please fill the required fields')
      return
    }

    try {
      setSubmitting(true)
      await tourAPI.createTourRequest({
        title: form.title.trim(),
        destinations,
        startDate: form.startDate,
        endDate: form.endDate,
        travelers: Number(form.travelers),
        budget: {
          min: Number(form.budgetMin),
          max: Number(form.budgetMax),
          currency: form.budgetCurrency
        },
        preferences: {
          accommodation: form.accommodation,
          transportation: form.transportation,
          activities,
          dietary: form.dietary,
          specialRequirements: form.specialRequirements
        }
      })

      toast.success('Tour request created')
      navigate('/tourist/requests')
    } catch (error) {
      console.error('Create tour request error:', error)
      toast.error(error.response?.data?.message || 'Failed to create tour request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Create Tour Request</h1>
        <p className="text-gray-600 mt-1">Tell providers where you want to go and what you need.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="space-y-2 md:col-span-2">
            <span className="font-medium text-gray-700">Trip title</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g. 5-day Colombo to Kandy family trip"
              className="input input-bordered w-full"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="font-medium text-gray-700 flex items-center gap-2"><FaMapMarkerAlt /> Destinations / places to visit</span>
            <textarea
              value={form.destinationsText}
              onChange={(e) => updateField('destinationsText', e.target.value)}
              placeholder="Colombo, Kandy, Nuwara Eliya, Ella"
              rows="3"
              className="input input-bordered w-full min-h-[96px]"
            />
          </label>

          <label className="space-y-2">
            <span className="font-medium text-gray-700 flex items-center gap-2"><FaCalendarAlt /> Start date</span>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => updateField('startDate', e.target.value)}
              className="input input-bordered w-full"
            />
          </label>

          <label className="space-y-2">
            <span className="font-medium text-gray-700 flex items-center gap-2"><FaCalendarAlt /> End date</span>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => updateField('endDate', e.target.value)}
              className="input input-bordered w-full"
            />
          </label>

          <label className="space-y-2">
            <span className="font-medium text-gray-700 flex items-center gap-2"><FaUsers /> Travelers</span>
            <input
              type="number"
              min="1"
              value={form.travelers}
              onChange={(e) => updateField('travelers', e.target.value)}
              className="input input-bordered w-full"
            />
          </label>

          <label className="space-y-2">
            <span className="font-medium text-gray-700 flex items-center gap-2"><FaRoute /> Transport preference</span>
            <select value={form.transportation} onChange={(e) => updateField('transportation', e.target.value)} className="input input-bordered w-full">
              <option value="">Select transport</option>
              <option value="car">Car</option>
              <option value="van">Van</option>
              <option value="bus">Bus</option>
              <option value="train">Train</option>
              <option value="tuk-tuk">Tuk-tuk</option>
              <option value="mixed">Mixed / Flexible</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="font-medium text-gray-700">Accommodation preference</span>
            <select value={form.accommodation} onChange={(e) => updateField('accommodation', e.target.value)} className="input input-bordered w-full">
              <option value="">Select accommodation</option>
              <option value="hotel">Hotel</option>
              <option value="guesthouse">Guest house</option>
              <option value="villa">Villa</option>
              <option value="resort">Resort</option>
              <option value="budget">Budget stay</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="font-medium text-gray-700">Budget minimum</span>
            <input
              type="number"
              min="0"
              value={form.budgetMin}
              onChange={(e) => updateField('budgetMin', e.target.value)}
              placeholder="500"
              className="input input-bordered w-full"
            />
          </label>

          <label className="space-y-2">
            <span className="font-medium text-gray-700">Budget maximum</span>
            <input
              type="number"
              min="0"
              value={form.budgetMax}
              onChange={(e) => updateField('budgetMax', e.target.value)}
              placeholder="1200"
              className="input input-bordered w-full"
            />
          </label>

          <label className="space-y-2">
            <span className="font-medium text-gray-700">Currency</span>
            <select value={form.budgetCurrency} onChange={(e) => updateField('budgetCurrency', e.target.value)} className="input input-bordered w-full">
              <option value="USD">USD</option>
              <option value="LKR">LKR</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="font-medium text-gray-700">Activities / experiences</span>
            <textarea
              value={form.activitiesText}
              onChange={(e) => updateField('activitiesText', e.target.value)}
              placeholder="Temple visit, waterfall hike, wildlife safari"
              rows="3"
              className="input input-bordered w-full min-h-[96px]"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="font-medium text-gray-700">Dietary needs</span>
            <input
              type="text"
              value={form.dietary}
              onChange={(e) => updateField('dietary', e.target.value)}
              placeholder="Vegetarian, halal, no seafood, etc."
              className="input input-bordered w-full"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="font-medium text-gray-700">Special requirements</span>
            <textarea
              value={form.specialRequirements}
              onChange={(e) => updateField('specialRequirements', e.target.value)}
              placeholder="Airport pickup, elderly-friendly pace, child seats, photography stops..."
              rows="4"
              className="input input-bordered w-full min-h-[112px]"
            />
          </label>
        </div>

        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-sm text-gray-700">
          {stayLength ? (
            <span>Planned stay: <strong>{stayLength} day{stayLength > 1 ? 's' : ''}</strong></span>
          ) : (
            <span>Choose your dates to calculate stay length.</span>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate('/tourist')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? 'Creating...' : 'Create Request'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TourRequestCreate