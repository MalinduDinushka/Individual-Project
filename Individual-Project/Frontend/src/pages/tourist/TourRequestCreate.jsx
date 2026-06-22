import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
  const { requestId } = useParams()
  const [form, setForm] = useState(defaultForm)
  const [selectedDistricts, setSelectedDistricts] = useState([])
  const [selectedLocationsByDistrict, setSelectedLocationsByDistrict] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const districtNameToId = useMemo(
    () => Object.values(districtLookup).reduce((acc, district) => {
      if (district?.name) acc[district.name] = district.id
      return acc
    }, {}),
    []
  )

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

  // package suggestions removed — using full-width form for a simpler flow

  const selectedLocations = useMemo(
    () => Object.values(selectedLocationsByDistrict).flat(),
    [selectedLocationsByDistrict]
  )

  const qualifiedSelectedLocations = useMemo(() => {
    const orderedDistrictIds = selectedDistricts.filter((districtId) => (selectedLocationsByDistrict[districtId] || []).length > 0)
    const qualified = []

    orderedDistrictIds.forEach((districtId) => {
      const districtName = districtLookup[districtId]?.name || ''
      const districtLocations = selectedLocationsByDistrict[districtId] || []

      districtLocations.forEach((location) => {
        if (!location) return

        // Give Maps enough context to resolve common place names inside Sri Lanka.
        const base = String(location).trim()
        const withDistrict = districtName ? `${base}, ${districtName}` : base
        qualified.push(`${withDistrict}, Sri Lanka`)
      })
    })

    return qualified
  }, [selectedDistricts, selectedLocationsByDistrict])

  const googleMapsRouteUrl = useMemo(() => {
    if (qualifiedSelectedLocations.length === 0) return ''

    const uniqueLocations = [...new Set(qualifiedSelectedLocations)].filter(Boolean)
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
  }, [qualifiedSelectedLocations])

  const routeStops = useMemo(
    () => selectedLocations.map((location, index) => ({
      index: index + 1,
      location
    })),
    [selectedLocations]
  )

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

  useEffect(() => {
    if (!requestId) return

    const loadRequest = async () => {
      try {
        const res = await tourAPI.getTourRequestById(requestId)
        const tourRequest = res.data.data.tourRequest
        if (!tourRequest) return

        const selectedIds = (tourRequest.districts || [])
          .map((districtName) => districtNameToId[districtName])
          .filter(Boolean)

        const locationsByDistrict = (tourRequest.locationPlan || []).reduce((acc, item) => {
          const districtId = districtNameToId[item.district]
          if (!districtId) return acc
          acc[districtId] = item.locations || []
          return acc
        }, {})

        setForm({
          title: tourRequest.title || '',
          extraDestinationsText: (tourRequest.destinations || [])
            .filter((destination) => !Object.values(locationsByDistrict).flat().includes(destination))
            .join(', '),
          startDate: tourRequest.startDate ? new Date(tourRequest.startDate).toISOString().slice(0, 10) : '',
          endDate: tourRequest.endDate ? new Date(tourRequest.endDate).toISOString().slice(0, 10) : '',
          travelers: tourRequest.travelers || 1,
          maleVisitors: tourRequest.visitorBreakdown?.male || 0,
          femaleVisitors: tourRequest.visitorBreakdown?.female || 0,
          kidsVisitors: tourRequest.visitorBreakdown?.kids || 0,
          budgetMin: tourRequest.budget?.min || '',
          budgetMax: tourRequest.budget?.max || '',
          budgetCurrency: tourRequest.budget?.currency || 'USD',
          accommodation: tourRequest.preferences?.accommodation || '',
          transportation: tourRequest.preferences?.transportation || '',
          activitiesText: (tourRequest.preferences?.activities || []).join(', '),
          serviceNeeds: tourRequest.preferences?.servicesNeeded || [],
          dietary: tourRequest.preferences?.dietary || '',
          specialRequirements: tourRequest.preferences?.specialRequirements || ''
        })
        setSelectedDistricts(selectedIds)
        setSelectedLocationsByDistrict(locationsByDistrict)
        setIsEditMode(true)
      } catch (error) {
        console.error('Load tour request error:', error)
        toast.error(error.response?.data?.message || 'Failed to load tour request for editing')
      }
    }

    loadRequest()
  }, [requestId, districtNameToId])

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

      const payload = {
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
      }

      if (isEditMode && requestId) {
        await tourAPI.updateTourRequest(requestId, payload)
        toast.success('Tour request updated')
      } else {
        await tourAPI.createTourRequest(payload)
        toast.success('Tour request created')
      }

      navigate('/tourist/requests')
    } catch (error) {
      console.error(isEditMode ? 'Update tour request error:' : 'Create tour request error:', error)
      toast.error(error.response?.data?.message || (isEditMode ? 'Failed to update tour request' : 'Failed to create tour request'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-1.5">
      <div>
        <h1 className="text-lg font-bold text-gray-800">Create Tour Request</h1>
        <p className="text-xs text-gray-600 mt-0">Tell us where & when you'd like to travel.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-1 space-y-1">
        <div className="space-y-1">
          <section className="rounded-lg border bg-slate-50/80 p-1 space-y-1">
            <h2 className="text-xs font-bold text-gray-900">Basics</h2>

            <label className="space-y-0.5 block">
              <span className="text-xs font-medium text-gray-700">Title *</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="7-day trip"
                className="input input-bordered w-full input-sm text-xs"
              />
              </label>

              <label className="space-y-1 block">
                <span className="text-xs font-medium text-gray-700 flex items-center gap-1"><FaMapMarkerAlt /> Additional places</span>
                <textarea
                  value={form.extraDestinationsText}
                  onChange={(e) => updateField('extraDestinationsText', e.target.value)}
                  placeholder="Extra places, separated by commas"
                  rows="2"
                  className="input input-bordered w-full min-h-[48px] text-xs"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                <label className="space-y-1 block">
                  <span className="text-xs font-medium text-gray-700 flex items-center gap-1"><FaCalendarAlt /> Start</span>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    className="input input-bordered w-full input-sm"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-xs font-medium text-gray-700 flex items-center gap-1"><FaCalendarAlt /> End</span>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => updateField('endDate', e.target.value)}
                    className="input input-bordered w-full input-sm"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                <label className="space-y-1 block">
                  <span className="text-xs font-medium text-gray-700">Min</span>
                  <input
                    type="number"
                    min="0"
                    value={form.budgetMin}
                    onChange={(e) => updateField('budgetMin', e.target.value)}
                    placeholder="500"
                    className="input input-bordered w-full input-sm text-xs"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-xs font-medium text-gray-700">Max</span>
                  <input
                    type="number"
                    min="0"
                    value={form.budgetMax}
                    onChange={(e) => updateField('budgetMax', e.target.value)}
                    placeholder="1200"
                    className="input input-bordered w-full input-sm text-xs"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-xs font-medium text-gray-700">Currency</span>
                  <select value={form.budgetCurrency} onChange={(e) => updateField('budgetCurrency', e.target.value)} className="input input-bordered w-full input-sm text-xs">
                    <option value="USD">USD</option>
                    <option value="LKR">LKR</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-lg border bg-white p-1.5 space-y-1.5">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Who is traveling</h2>
                <p className="text-xs text-gray-500">Group makeup for vehicle and planning.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                {genderBreakdownCards.map((card) => {
                  const Icon = card.icon
                  const value = form[`${card.key}Visitors`]
                  return (
                    <label key={card.key} className="rounded-lg border bg-slate-50 p-1 space-y-1 block">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1 text-gray-700 text-xs font-medium">
                          <Icon className="text-sm" />
                          {card.label}
                        </div>
                        <span className="text-xs text-gray-400">Count</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={value}
                        onChange={(e) => updateVisitorCount(`${card.key}Visitors`, e.target.value)}
                        className="input input-bordered w-full input-sm text-xs"
                      />
                    </label>
                  )
                })}

                <div className="rounded-lg border border-primary/10 bg-primary/5 p-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="mt-0.5 text-xl font-bold text-gray-900">{form.travelers}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">Auto-updates.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                <label className="space-y-1 block">
                  <span className="text-xs font-medium text-gray-700 flex items-center gap-1"><FaRoute /> Travel</span>
                  <select value={form.transportation} onChange={(e) => updateField('transportation', e.target.value)} className="input input-bordered w-full input-sm text-xs">
                    <option value="">Select mode</option>
                    {travelModes.map((mode) => (
                      <option key={mode.value} value={mode.value}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1 block">
                  <span className="text-xs font-medium text-gray-700 flex items-center gap-1"><FaUsers /> Accommodation</span>
                  <select value={form.accommodation} onChange={(e) => updateField('accommodation', e.target.value)} className="input input-bordered w-full input-sm text-xs">
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

            <section className="rounded-lg border bg-white p-1.5 space-y-1.5">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Services needed</h2>
                <p className="text-xs text-gray-500">Select services relevant to your request.</p>
              </div>

              <div className="flex flex-wrap gap-1">
                {serviceOptions.map((service) => {
                  const selected = form.serviceNeeds.includes(service.id)
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleServiceNeed(service.id)}
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${selected ? 'bg-primary text-white border-primary shadow-sm' : 'bg-slate-50 text-gray-700 border-gray-200 hover:border-primary hover:text-primary'}`}
                    >
                      {service.label}
                    </button>
                  )
                })}
              </div>

              <label className="space-y-1 block">
                <span className="text-xs font-medium text-gray-700">Activities</span>
                <textarea
                  value={form.activitiesText}
                  onChange={(e) => updateField('activitiesText', e.target.value)}
                  placeholder="Temple, waterfall, safari"
                  rows="2"
                  className="input input-bordered w-full min-h-[48px] text-xs"
                />
              </label>

              <label className="space-y-1 block">
                <span className="text-xs font-medium text-gray-700">Dietary needs</span>
                <input
                  type="text"
                  value={form.dietary}
                  onChange={(e) => updateField('dietary', e.target.value)}
                  placeholder="Vegetarian, halal, etc."
                  className="input input-bordered w-full input-sm text-xs"
                />
              </label>

              <label className="space-y-1 block">
                <span className="text-xs font-medium text-gray-700">Special requirements</span>
                <textarea
                  value={form.specialRequirements}
                  onChange={(e) => updateField('specialRequirements', e.target.value)}
                  placeholder="Pickup, pace, seats, stops..."
                  rows="2"
                  className="input input-bordered w-full min-h-[48px] text-xs"
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

            <section className="rounded-lg border bg-white p-1 space-y-1">
              <div>
                <h3 className="text-xs font-semibold text-gray-800">Map</h3>
                <p className="text-xs text-gray-500 mt-0.5">Route preview</p>
              </div>

              <div className="rounded-lg border bg-slate-50 p-1">
                {routeStops.length > 0 ? (
                  <div className="space-y-0.5">
                    <div className="max-h-16 overflow-y-auto space-y-0.5 pr-1">
                      {routeStops.slice(0, 10).map((stop) => (
                        <div key={`${stop.index}-${stop.location}`} className="flex items-start gap-0.5 rounded-md bg-white border px-1 py-0.5 text-xs">
                          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            {stop.index}
                          </span>
                          <span className="text-gray-700 leading-5 text-xs">{stop.location}</span>
                        </div>
                      ))}
                    </div>
                    {routeStops.length > 10 && (
                      <p className="text-xs text-gray-500">+{routeStops.length - 10} more stops</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Pick districts to auto-build route.</p>
                )}
              </div>

              {googleMapsRouteUrl && (
                <a
                  href={googleMapsRouteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-full bg-primary px-2 py-1 text-xs font-semibold text-white transition hover:bg-primary/90"
                >
                  Google Maps Route
                </a>
              )}
            </section>
          </div>

        <div className="bg-primary/5 border border-primary/10 rounded-lg p-1 text-xs text-gray-700\">
          {stayLength ? (
            <span>Stay: <strong>{stayLength}d</strong></span>
          ) : (
            <span>Select dates.</span>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={() => navigate('/tourist')} className="btn btn-secondary btn-sm text-xs">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn btn-primary btn-sm text-xs">
            {submitting ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TourRequestCreate