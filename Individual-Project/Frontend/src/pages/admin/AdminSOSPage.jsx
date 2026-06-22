import { useEffect, useMemo, useState } from 'react'
import { FaSearch, FaPhoneAlt, FaMapMarkerAlt, FaExclamationTriangle, FaCheckCircle, FaClock } from 'react-icons/fa'
import { adminAPI } from '../../api'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { connectSocket } from '../../utils/socket'

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'false-alarm', label: 'False Alarm' }
]

const priorityBadge = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700'
}

const AdminSOSPage = () => {
  const token = useAuthStore((state) => state.token)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const fetchAlerts = async (filters = {}) => {
    try {
      setLoading(true)
      const response = await adminAPI.getSOSAlerts(filters)
      if (response.data.success) {
        setAlerts(response.data.data || [])
      }
    } catch (error) {
      console.error('Load SOS alerts error:', error)
      toast.error(error.response?.data?.message || 'Failed to load SOS alerts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  useEffect(() => {
    if (!token) return

    const socket = connectSocket(token)
    const handleNewSOS = ({ sos }) => {
      if (!sos) {
        fetchAlerts()
        return
      }
      setAlerts((current) => [sos, ...current.filter((item) => item._id !== sos._id)])
      toast.error('New tourist SOS alert received')
    }
    const handleSOSUpdate = ({ sos }) => {
      if (!sos) {
        fetchAlerts()
        return
      }
      setAlerts((current) => current.map((item) => item._id === sos._id ? sos : item))
    }

    socket.on('sos:new', handleNewSOS)
    socket.on('sos:update', handleSOSUpdate)

    return () => {
      socket.off('sos:new', handleNewSOS)
      socket.off('sos:update', handleSOSUpdate)
    }
  }, [token])

  const filteredAlerts = useMemo(() => alerts, [alerts])
  const activeCount = alerts.filter((alert) => alert.status === 'active').length
  const inProgressCount = alerts.filter((alert) => alert.status === 'in-progress').length
  const resolvedCount = alerts.filter((alert) => alert.status === 'resolved').length

  const handleSearch = async (event) => {
    event.preventDefault()
    const params = {}
    if (search.trim()) params.search = search.trim()
    if (status) params.status = status
    await fetchAlerts(params)
  }

  const updateAlert = async (alert, nextStatus) => {
    try {
      const response = await adminAPI.updateSOSAlert(alert._id, { status: nextStatus })
      if (response.data.success) {
        toast.success(response.data.message)
        setAlerts((current) => current.map((item) => item._id === alert._id ? response.data.data : item))
      }
    } catch (error) {
      console.error('Update SOS alert error:', error)
      toast.error(error.response?.data?.message || 'Failed to update SOS alert')
    }
  }

  if (loading) {
    return <div className="rounded-xl bg-white p-6 shadow-md">Loading SOS alerts...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-800">SOS Alerts</h1>
        <p className="text-gray-600">Monitor active alerts and update their status in real time.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-red-100 bg-red-50 p-5">
          <div className="text-sm font-semibold text-red-700">Active emergencies</div>
          <div className="mt-2 text-3xl font-extrabold text-red-800">{activeCount}</div>
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-5">
          <div className="text-sm font-semibold text-amber-700">In progress</div>
          <div className="mt-2 text-3xl font-extrabold text-amber-800">{inProgressCount}</div>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-5">
          <div className="text-sm font-semibold text-emerald-700">Resolved</div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-800">{resolvedCount}</div>
        </div>
      </div>

      <form onSubmit={handleSearch} className="grid gap-3 md:grid-cols-3 bg-white p-4 rounded-xl shadow-md">
        <label className="md:col-span-2 flex items-center gap-2 rounded-lg border px-3 py-2">
          <FaSearch className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none"
            placeholder="Search by type, description, tourist, or location"
          />
        </label>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border px-3 py-2">
          {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>

        <div className="md:col-span-3 flex gap-2">
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-white">Filter</button>
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setStatus('')
              fetchAlerts()
            }}
            className="rounded-lg border px-4 py-2 text-gray-700"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-md">
            No SOS alerts found
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div key={alert._id} className={`rounded-xl bg-white p-6 shadow-md border ${alert.status === 'active' ? 'border-red-200 ring-2 ring-red-50' : 'border-gray-100'}`}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityBadge[alert.priority] || 'bg-gray-100 text-gray-700'}`}>
                      {alert.priority}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {alert.status}
                    </span>
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 inline-flex items-center gap-1">
                      <FaExclamationTriangle />
                      {alert.emergencyType}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{alert.tourist?.name || 'Unknown tourist'}</h3>
                    <p className="text-sm text-gray-500">{alert.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <a href={`tel:${alert.contactNumber}`} className="inline-flex items-center gap-2 font-semibold text-primary hover:text-primary-dark"><FaPhoneAlt /> {alert.contactNumber}</a>
                    <span className="inline-flex items-center gap-2"><FaMapMarkerAlt /> {alert.location?.address || 'No address provided'}</span>
                    {alert.location?.latitude && alert.location?.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${alert.location.latitude},${alert.location.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 font-semibold text-primary hover:text-primary-dark"
                      >
                        Open GPS map
                      </a>
                    )}
                    <span className="inline-flex items-center gap-2"><FaClock /> {new Date(alert.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateAlert(alert, 'in-progress')}
                    disabled={alert.status === 'in-progress'}
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaClock />
                    In Progress
                  </button>
                  <button
                    onClick={() => updateAlert(alert, 'resolved')}
                    disabled={alert.status === 'resolved'}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-3 py-2 text-sm text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaCheckCircle />
                    Resolve
                  </button>
                  <button
                    onClick={() => updateAlert(alert, 'false-alarm')}
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-3 py-2 text-sm text-white hover:bg-gray-800"
                  >
                    Mark False Alarm
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AdminSOSPage
