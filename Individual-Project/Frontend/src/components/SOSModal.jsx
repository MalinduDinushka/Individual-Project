import { useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  FaAmbulance,
  FaBolt,
  FaCrosshairs,
  FaExclamationTriangle,
  FaFire,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShieldAlt,
  FaTimes,
  FaUserShield
} from 'react-icons/fa'
import { sosAPI } from '../api'
import { useAuthStore } from '../store/authStore'

const emergencyOptions = [
  { value: 'medical', label: 'Medical', helper: 'Injury, illness, urgent treatment', icon: FaAmbulance },
  { value: 'accident', label: 'Accident', helper: 'Road accident, fall, unsafe incident', icon: FaExclamationTriangle },
  { value: 'harassment', label: 'Harassment', helper: 'Unsafe behavior, assault, stalking', icon: FaUserShield },
  { value: 'theft', label: 'Theft / threat', helper: 'Robbery, stolen items, intimidation', icon: FaShieldAlt },
  { value: 'lost', label: 'Lost / stranded', helper: 'Lost route, no transport, separated', icon: FaMapMarkerAlt },
  { value: 'fire', label: 'Fire', helper: 'Fire, smoke, rescue needed', icon: FaFire },
  { value: 'natural-disaster', label: 'Disaster', helper: 'Flood, landslide, severe weather', icon: FaBolt },
  { value: 'other', label: 'Other', helper: 'Another emergency situation', icon: FaPhoneAlt }
]

const nationalEmergencyContacts = [
  { label: 'Police emergency', number: '119', note: 'Island-wide police emergency line' },
  { label: 'Ambulance - Suwa Seriya', number: '1990', note: 'Free island-wide ambulance service' },
  { label: 'Fire / rescue', number: '110', note: 'Ambulance, fire and rescue support' }
]

const localEmergencyContacts = [
  {
    keywords: ['ella', 'bandarawela', 'badulla', 'haputale'],
    area: 'Ella / Badulla area',
    police: { label: 'Ella Police Station', number: '057-2228522' },
    hospital: { label: 'Provincial General Hospital Badulla', number: '055-2222261' }
  },
  {
    keywords: ['kandy', 'peradeniya'],
    area: 'Kandy area',
    police: { label: 'Kandy Police Station', number: '081-2222222' },
    hospital: { label: 'National Hospital Kandy', number: '081-2222261' }
  },
  {
    keywords: ['mirissa', 'weligama'],
    area: 'Mirissa / Weligama area',
    police: { label: 'Weligama Police Station', number: '041-2250222' },
    hospital: { label: 'District General Hospital Matara', number: '041-2222261' }
  },
  {
    keywords: ['matara'],
    area: 'Matara area',
    police: { label: 'Matara Police Station', number: '041-2222223' },
    hospital: { label: 'District General Hospital Matara', number: '041-2222261' }
  },
  {
    keywords: ['galle', 'hikkaduwa', 'unawatuna'],
    area: 'Galle area',
    police: { label: 'Galle Police Station', number: '091-2222222' },
    hospital: { label: 'Teaching Hospital Karapitiya', number: '091-2222261' }
  },
  {
    keywords: ['colombo', 'fort', 'pettah', 'bambalapitiya', 'wellawatte', 'borella', 'narahenpita'],
    area: 'Colombo area',
    police: { label: 'Police Headquarters Colombo', number: '011-2421111' },
    hospital: { label: 'National Hospital Colombo', number: '011-2691111' }
  },
  {
    keywords: ['negombo', 'katunayake'],
    area: 'Negombo / airport area',
    police: { label: 'Negombo Police Division', number: '031-2226181' },
    hospital: { label: 'District General Hospital Negombo', number: '031-2222261' }
  }
]

const phoneHref = (number) => `tel:${String(number).replace(/\s+/g, '')}`

const SOSModal = ({ open, onClose }) => {
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [emergencyType, setEmergencyType] = useState('medical')
  const [description, setDescription] = useState('')
  const [contactNumber, setContactNumber] = useState(user?.phone || '')
  const [location, setLocation] = useState({ latitude: null, longitude: null, address: '' })

  const selectedEmergency = useMemo(
    () => emergencyOptions.find((option) => option.value === emergencyType) || emergencyOptions[0],
    [emergencyType]
  )

  const matchedLocalContacts = useMemo(() => {
    const address = location.address.trim().toLowerCase()
    if (!address) return null
    return localEmergencyContacts.find((item) => item.keywords.some((keyword) => address.includes(keyword))) || null
  }, [location.address])

  const resetForm = () => {
    setEmergencyType('medical')
    setDescription('')
    setContactNumber(user?.phone || '')
    setLocation({ latitude: null, longitude: null, address: '' })
  }

  const tryGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error('GPS is not available in this browser')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation((current) => ({
          ...current,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }))
        setLocating(false)
        toast.success('GPS location added. Add a town or landmark to show local numbers.')
      },
      (err) => {
        console.warn('Geolocation failed:', err.message)
        setLocating(false)
        toast.error('Could not get GPS location. Add a landmark or address.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
  }

  const submit = async () => {
    if (!contactNumber.trim()) {
      toast.error('Add a contact number for emergency support')
      return
    }

    if (!description.trim()) {
      toast.error('Describe what happened so admins can respond correctly')
      return
    }

    try {
      setLoading(true)
      const payload = {
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address.trim()
        },
        emergencyType,
        description: description.trim(),
        contactNumber: contactNumber.trim()
      }

      const res = await sosAPI.createSOSAlert(payload)
      if (res.data?.success) {
        toast.success('SOS alert sent to admin emergency support')
        resetForm()
        onClose()
      } else {
        toast.error(res.data?.message || 'Failed to send SOS')
      }
    } catch (error) {
      console.error('SOS submit error:', error)
      toast.error(error.response?.data?.message || 'Failed to send SOS')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  const SelectedIcon = selectedEmergency.icon

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/65 px-3 py-8 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-5xl flex-col rounded-lg bg-white shadow-2xl" style={{ marginTop: '40px', marginBottom: '40px' }}>
        <div className="shrink-0 rounded-t-lg bg-gradient-to-r from-rose-700 to-red-600 px-5 py-4 text-white" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <SelectedIcon className="text-xl" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-extrabold">Emergency Support SOS</h3>
                <p className="mt-1 text-sm leading-5 text-white/82">
                  Choose the emergency, add your location, then send an alert to TourMate admins.
                </p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white" aria-label="Close SOS">
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto p-4 md:p-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-800">Select emergency situation</label>
                <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                  <select
                    value={emergencyType}
                    onChange={(e) => setEmergencyType(e.target.value)}
                    className="input w-full border-slate-200 bg-slate-50 text-slate-900"
                  >
                    {emergencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setEmergencyType(emergencyOptions[0].value)}
                    className="btn btn-secondary whitespace-nowrap"
                  >
                    Quick choose
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {emergencyOptions.map((option) => {
                    const Icon = option.icon
                    const selected = emergencyType === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setEmergencyType(option.value)}
                        className={`rounded-lg border p-3 text-left transition ${
                          selected
                            ? 'border-rose-300 bg-rose-50 text-rose-900 ring-2 ring-rose-100'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={selected ? 'text-rose-600' : 'text-slate-400'} />
                          <span className="font-bold text-sm">{option.label}</span>
                        </div>
                        <p className="mt-1 text-[11px] leading-4 text-slate-500">{option.helper}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-800">Your contact number</span>
                  <div className="relative">
                    <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="input pl-11"
                      placeholder="+94 77 123 4567"
                    />
                  </div>
                </label>

                <div>
                  <span className="mb-2 block text-sm font-bold text-slate-800">Location</span>
                  <div className="flex flex-col gap-2 sm:flex-row md:flex-col xl:flex-row">
                    <div className="relative flex-1">
                      <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={location.address}
                        onChange={(e) => setLocation((current) => ({ ...current, address: e.target.value }))}
                        className="input pl-11"
                        placeholder="Town, hotel, landmark"
                      />
                    </div>
                    <button onClick={tryGeolocation} type="button" className="btn btn-secondary shrink-0" disabled={locating}>
                      <FaCrosshairs />
                      {locating ? 'Locating...' : 'GPS'}
                    </button>
                  </div>
                  {location.latitude && location.longitude && (
                    <div className="mt-2 text-xs font-medium text-slate-500">
                      GPS: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                    </div>
                  )}
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800">What happened?</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input min-h-[92px]"
                  placeholder="Example: I am injured near Ella railway station and need urgent help."
                />
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                <button onClick={submit} disabled={loading} className="btn bg-rose-600 text-white hover:bg-rose-700">
                  <FaExclamationTriangle />
                  {loading ? 'Sending...' : 'Send emergency SOS'}
                </button>
              </div>
            </div>

            <aside className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm text-rose-950">
              <h4 className="font-extrabold">Emergency numbers</h4>
              <p className="mt-1 text-xs leading-5 text-rose-800">
                Call emergency services first for life-threatening situations. TourMate admins will also see your SOS.
              </p>

              <div className="mt-4 space-y-2">
                {nationalEmergencyContacts.map((contact) => (
                  <a key={contact.label} href={phoneHref(contact.number)} className="block rounded-lg bg-white p-3 hover:bg-rose-100/60">
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-rose-500">{contact.label}</div>
                    <div className="mt-1 text-lg font-extrabold">{contact.number}</div>
                    <div className="text-xs leading-4 text-slate-500">{contact.note}</div>
                  </a>
                ))}
              </div>

              <div className="mt-4 border-t border-rose-200 pt-4">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-rose-500">Nearest contacts</div>
                {matchedLocalContacts ? (
                  <div className="mt-2 space-y-2">
                    <div className="font-bold text-slate-900">{matchedLocalContacts.area}</div>
                    <a href={phoneHref(matchedLocalContacts.police.number)} className="block rounded-lg bg-white p-3 hover:bg-rose-100/60">
                      <div className="text-xs font-semibold text-slate-500">Police station</div>
                      <div className="mt-1 font-extrabold text-slate-950">{matchedLocalContacts.police.label}</div>
                      <div className="text-lg font-extrabold text-rose-700">{matchedLocalContacts.police.number}</div>
                    </a>
                    <a href={phoneHref(matchedLocalContacts.hospital.number)} className="block rounded-lg bg-white p-3 hover:bg-rose-100/60">
                      <div className="text-xs font-semibold text-slate-500">Hospital</div>
                      <div className="mt-1 font-extrabold text-slate-950">{matchedLocalContacts.hospital.label}</div>
                      <div className="text-lg font-extrabold text-rose-700">{matchedLocalContacts.hospital.number}</div>
                    </a>
                  </div>
                ) : (
                  <div className="mt-2 rounded-lg bg-white p-3 text-xs leading-5 text-slate-600">
                    Type a nearby town such as Ella, Kandy, Colombo, Galle, Mirissa, Matara, or Negombo to show local police and hospital numbers.
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SOSModal
