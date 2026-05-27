import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBus, FaCalendarAlt, FaCar, FaChild, FaFemale, FaMapMarkerAlt, FaMale, FaRoute, FaUsers } from 'react-icons/fa'
import { tourAPI } from '../../api'
import { toast } from 'react-hot-toast'
import SriLankaDistrictPicker from '../../components/tourist/SriLankaDistrictPicker'
import { districtLookup } from '../../data/sriLankaTour'

const serviceOptions = [
  { id: 'guide', label: 'Guide' },
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'driver', label: 'Driver' },
  { id: 'hotel', label: 'Hotel / Stay' },
  { id: 'food', label: 'Food / Meals' },
  { id: 'tickets', label: 'Entrance tickets' },
  { id: 'pickup', label: 'Airport pickup' },
  { id: 'photographer', label: 'Photographer' }
]

const travelModes = [
  { value: 'car', label: 'Car', icon: FaCar },
  { value: 'van', label: 'Van', icon: FaBus },
  { value: 'bus', label: 'Bus', icon: FaBus },
  { value: 'train', label: 'Train', icon: FaRoute },
  { value: 'tuk-tuk', label: 'Tuk-tuk', icon: FaRoute },
  { value: 'mixed', label: 'Mixed / Flexible', icon: FaRoute }
]

const defaultForm = {
  title: '',
  extraDestinationsText: '',
  startDate: '',
  endDate: '',
  travelers: 1,
  maleVisitors: 0,
  femaleVisitors: 0,
  kidsVisitors: 0,
  budgetMin: '',
  budgetMax: '',
  budgetCurrency: 'USD',
  accommodation: '',
  transportation: '',
  activitiesText: '',
  serviceNeeds: [],
  dietary: '',
  specialRequirements: ''
}

const TourRequestCreate = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState(defaultForm)
  const [selectedDistricts, setSelectedDistricts] = useState([])
  const [selectedLocationsByDistrict, setSelectedLocationsByDistrict] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const stayLength = useMemo(() => {
    if (!form.startDate || !form.endDate) return null
    const start = new Date(form.startDate)
    const end = new Date(form.endDate)
    const diffDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
    return diffDays
  }, [form.startDate, form.endDate])

  const genderBreakdownCards = useMemo(() => ([
    { key: 'male', label: 'Male visitors', icon: FaMale },
    { key: 'female', label: 'Female visitors', icon: FaFemale },
    { key: 'kids', label: 'Kids', icon: FaChild }
  ]), [])

  const selectedDistrictNames = useMemo(
    () => selectedDistricts.map((districtId) => districtLookup[districtId]?.name).filter(Boolean),
    [selectedDistricts]
  )

  const selectedLocations = useMemo(
    () => Object.values(selectedLocationsByDistrict).flat(),
    [selectedLocationsByDistrict]
  )

  const googleMapsRouteUrl = useMemo(() => {
    if (selectedLocations.length === 0) return ''

    const uniqueLocations = [...new Set(selectedLocations)].filter(Boolean)
    if (uniqueLocations.length === 1) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(uniqueLocations[0])}`
    }

    const params = new URLSearchParams({
      api: '1',
      origin: uniqueLocations[0],
      destination: uniqueLocations[uniqueLocations.length - 1],
      travelmode: 'driving'
    })

    if (uniqueLocations.length > 2) {
      params.set('waypoints', uniqueLocations.slice(1, -1).join('|'))
    }

    return `https://www.google.com/maps/dir/?${params.toString()}`
  }, [selectedLocations])

  const locationPlan = useMemo(
    () =>
      selectedDistricts.map((districtId) => ({
        district: districtLookup[districtId]?.name || districtId,
        locations: selectedLocationsByDistrict[districtId] || []
      })),
    [selectedDistricts, selectedLocationsByDistrict]
  )

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const updateVisitorCount = (field, value) => {
    const numericValue = Math.max(0, Number(value) || 0)
    setForm((current) => {
      const next = { ...current, [field]: numericValue }
      const totalVisitors = Number(next.maleVisitors || 0) + Number(next.femaleVisitors || 0) + Number(next.kidsVisitors || 0)
      next.travelers = Math.max(1, totalVisitors || Number(next.travelers) || 1)
      return next
    })
  }

  const toggleServiceNeed = (serviceId) => {
    setForm((current) => {
      const selected = current.serviceNeeds || []
      return {
        ...current,
        serviceNeeds: selected.includes(serviceId)
          ? selected.filter((item) => item !== serviceId)
          : [...selected, serviceId]
      }
    })
  }

  const setDistrictSelection = (nextDistricts) => {
    setSelectedDistricts(nextDistricts)
    setSelectedLocationsByDistrict((current) => {
      return nextDistricts.reduce((acc, districtId) => {
        if (current[districtId]) {
          acc[districtId] = current[districtId]
        }
        return acc
      }, {})
    })
  }

  const toggleDistrict = (districtId) => {
    setSelectedDistricts((current) => {
      if (current.includes(districtId)) {
        return current.filter((item) => item !== districtId)
      }
      return [...current, districtId]
    })

    setSelectedLocationsByDistrict((current) => {
      if (current[districtId]) {
        const next = { ...current }
        delete next[districtId]
        return next
      }
      return current
    })
  }

  const toggleLocation = (districtId, location) => {
    setSelectedDistricts((current) => (current.includes(districtId) ? current : [...current, districtId]))
    setSelectedLocationsByDistrict((current) => {
      const selected = current[districtId] || []
      const nextLocations = selected.includes(location)
        ? selected.filter((item) => item !== location)
        : [...selected, location]

      return {
        ...current,
        [districtId]: nextLocations
      }
    })
  }

  const selectAllLocations = (districtId) => {
    const district = districtLookup[districtId]
    if (!district) return

    setSelectedDistricts((current) => (current.includes(districtId) ? current : [...current, districtId]))
    setSelectedLocationsByDistrict((current) => ({
      ...current,
      [districtId]: [...district.popularLocations]
    }))
  }

  const clearDistrict = (districtId) => {
    setSelectedDistricts((current) => current.filter((item) => item !== districtId))
    setSelectedLocationsByDistrict((current) => {
      const next = { ...current }
      delete next[districtId]
      return next
    })
  }

  const clearAllDistrictSelection = () => {
    setSelectedDistricts([])
    setSelectedLocationsByDistrict({})
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const extraDestinations = form.extraDestinationsText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    const activities = form.activitiesText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    const destinations = [...selectedLocations, ...extraDestinations]

    if (!form.title.trim() || !form.startDate || !form.endDate) {
      toast.error('Please fill the required fields')
      return
    }

    if (selectedDistricts.length === 0 && destinations.length === 0) {
      toast.error('Select at least one district or destination')
      return
    }

    const finalDestinations = destinations.length > 0 ? destinations : selectedDistrictNames

    try {
      setSubmitting(true)
      await tourAPI.createTourRequest({
        title: form.title.trim(),
        districts: selectedDistrictNames,
        locationPlan,
        destinations: finalDestinations,
        startDate: form.startDate,
        endDate: form.endDate,
        travelers: Number(form.travelers),
        visitorBreakdown: {
          male: Number(form.maleVisitors || 0),
          female: Number(form.femaleVisitors || 0),
          kids: Number(form.kidsVisitors || 0)
        },
        budget: {
          min: Number(form.budgetMin),
          max: Number(form.budgetMax),
          currency: form.budgetCurrency
        },
        preferences: {
          accommodation: form.accommodation,
          transportation: form.transportation,
          activities,
          servicesNeeded: form.serviceNeeds,
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
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Create Tour Request</h1>
        <p className="text-gray-600 mt-1">Choose districts first, then pick the best places to visit inside each district.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6">
          <div className="space-y-6">
            <section className="rounded-3xl border bg-slate-50/80 p-5 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Trip basics</h2>
                <p className="text-sm text-gray-500">Start with the trip title, dates, budget, and where you want to go.</p>
              </div>

              <label className="space-y-2 block">
                <span className="font-medium text-gray-700">Trip title</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g. 7-day Sri Lanka south coast and hill country trip"
                  className="input input-bordered w-full"
                />
              </label>

              <label className="space-y-2 block">
                <span className="font-medium text-gray-700 flex items-center gap-2"><FaMapMarkerAlt /> Additional places to visit</span>
                <textarea
                  value={form.extraDestinationsText}
                  onChange={(e) => updateField('extraDestinationsText', e.target.value)}
                  placeholder="Optional: add any extra places not listed in the district picker, separated by commas"
                  rows="3"
                  className="input input-bordered w-full min-h-[96px]"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2 block">
                  <span className="font-medium text-gray-700 flex items-center gap-2"><FaCalendarAlt /> Start date</span>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    className="input input-bordered w-full"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="font-medium text-gray-700 flex items-center gap-2"><FaCalendarAlt /> End date</span>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => updateField('endDate', e.target.value)}
                    className="input input-bordered w-full"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="space-y-2 block">
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

                <label className="space-y-2 block">
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

                <label className="space-y-2 block">
                  <span className="font-medium text-gray-700">Currency</span>
                  <select value={form.budgetCurrency} onChange={(e) => updateField('budgetCurrency', e.target.value)} className="input input-bordered w-full">
                    <option value="USD">USD</option>
                    <option value="LKR">LKR</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-3xl border bg-white p-5 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Who is traveling</h2>
                <p className="text-sm text-gray-500">Tell providers the group makeup so they can suggest the right vehicle and plan.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {genderBreakdownCards.map((card) => {
                  const Icon = card.icon
                  const value = form[`${card.key}Visitors`]
                  return (
                    <label key={card.key} className="rounded-2xl border bg-slate-50 p-4 space-y-3 block">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                          <Icon />
                          {card.label}
                        </div>
                        <span className="text-xs text-gray-400">Count</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={value}
                        onChange={(e) => updateVisitorCount(`${card.key}Visitors`, e.target.value)}
                        className="input input-bordered w-full"
                      />
                    </label>
                  )
                })}

                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total visitors</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{form.travelers}</p>
                  </div>
                  <p className="mt-3 text-xs text-gray-500">This updates automatically from the male and female counts.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-2 block">
                  <span className="font-medium text-gray-700 flex items-center gap-2"><FaRoute /> Mode of travel</span>
                  <select value={form.transportation} onChange={(e) => updateField('transportation', e.target.value)} className="input input-bordered w-full">
                    <option value="">Select travel mode</option>
                    {travelModes.map((mode) => (
                      <option key={mode.value} value={mode.value}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 block">
                  <span className="font-medium text-gray-700 flex items-center gap-2"><FaUsers /> Accommodation</span>
                  <select value={form.accommodation} onChange={(e) => updateField('accommodation', e.target.value)} className="input input-bordered w-full">
                    <option value="">Select accommodation</option>
                    <option value="hotel">Hotel</option>
                    <option value="guesthouse">Guest house</option>
                    <option value="villa">Villa</option>
                    <option value="resort">Resort</option>
                    <option value="budget">Budget stay</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-3xl border bg-white p-5 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Services needed</h2>
                <p className="text-sm text-gray-500">Only providers offering these services will quickly understand your request.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {serviceOptions.map((service) => {
                  const selected = form.serviceNeeds.includes(service.id)
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleServiceNeed(service.id)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${selected ? 'bg-primary text-white border-primary shadow-sm' : 'bg-slate-50 text-gray-700 border-gray-200 hover:border-primary hover:text-primary'}`}
                    >
                      {service.label}
                    </button>
                  )
                })}
              </div>

              <label className="space-y-2 block">
                <span className="font-medium text-gray-700">Activities / experiences</span>
                <textarea
                  value={form.activitiesText}
                  onChange={(e) => updateField('activitiesText', e.target.value)}
                  placeholder="Temple visit, waterfall hike, wildlife safari"
                  rows="3"
                  className="input input-bordered w-full min-h-[96px]"
                />
              </label>

              <label className="space-y-2 block">
                <span className="font-medium text-gray-700">Dietary needs</span>
                <input
                  type="text"
                  value={form.dietary}
                  onChange={(e) => updateField('dietary', e.target.value)}
                  placeholder="Vegetarian, halal, no seafood, etc."
                  className="input input-bordered w-full"
                />
              </label>

              <label className="space-y-2 block">
                <span className="font-medium text-gray-700">Special requirements</span>
                <textarea
                  value={form.specialRequirements}
                  onChange={(e) => updateField('specialRequirements', e.target.value)}
                  placeholder="Airport pickup, elderly-friendly pace, child seats, photography stops..."
                  rows="4"
                  className="input input-bordered w-full min-h-[112px]"
                />
              </label>
            </section>

            <SriLankaDistrictPicker
              selectedDistricts={selectedDistricts}
              selectedLocationsByDistrict={selectedLocationsByDistrict}
              onToggleDistrict={toggleDistrict}
              onToggleLocation={toggleLocation}
              onSelectAllLocations={selectAllLocations}
              onClearDistrict={clearDistrict}
              onClearAll={clearAllDistrictSelection}
              onSelectDistricts={setDistrictSelection}
            />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-4 self-start">
            <div className="rounded-3xl border bg-white p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-gray-800">Request summary</h3>
                <span className="text-xs text-gray-500">What providers will see</span>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Districts</p>
                  {selectedDistrictNames.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedDistrictNames.map((district) => (
                        <span key={district} className="rounded-full bg-primary/10 text-primary px-3 py-1">
                          {district}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No districts selected yet.</p>
                  )}
                </div>

                <div>
                  <p className="text-gray-500 mb-1">Selected places</p>
                  {selectedLocations.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedLocations.slice(0, 8).map((location) => (
                        <span key={location} className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1">
                          {location}
                        </span>
                      ))}
                      {selectedLocations.length > 8 && (
                        <span className="rounded-full bg-gray-100 text-gray-600 px-3 py-1">
                          +{selectedLocations.length - 8} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400">No popular places selected yet.</p>
                  )}
                </div>

                <div>
                  <p className="text-gray-500 mb-1">Services needed</p>
                  {form.serviceNeeds.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {form.serviceNeeds.map((serviceId) => (
                        <span key={serviceId} className="rounded-full bg-slate-100 text-slate-700 px-3 py-1">
                          {serviceOptions.find((service) => service.id === serviceId)?.label || serviceId}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No services selected yet.</p>
                  )}
                </div>

                <div>
                  <p className="text-gray-500 mb-1">Visitor split</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-gray-500 text-xs">Male</p>
                      <p className="mt-1 font-semibold text-gray-900">{form.maleVisitors}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-gray-500 text-xs">Female</p>
                      <p className="mt-1 font-semibold text-gray-900">{form.femaleVisitors}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-gray-500 text-xs">Kids</p>
                      <p className="mt-1 font-semibold text-gray-900">{form.kidsVisitors}</p>
                    </div>
                  </div>
                </div>

                {googleMapsRouteUrl && (
                  <a
                    href={googleMapsRouteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
                  >
                    Open Google Maps route
                  </a>
                )}
              </div>

              {selectedDistrictNames.length === 0 && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  Tip: choose districts first to make your request more useful to providers.
                </p>
              )}
            </div>
          </aside>
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