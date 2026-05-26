import { useState } from 'react'
import { sosAPI } from '../api'
import { toast } from 'react-hot-toast'

const SOSModal = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [emergencyType, setEmergencyType] = useState('medical')
  const [description, setDescription] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [location, setLocation] = useState({ latitude: null, longitude: null, address: '' })

  const tryGeolocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation((l) => ({ ...l, latitude: pos.coords.latitude, longitude: pos.coords.longitude }))
    }, (err) => {
      console.warn('Geolocation failed:', err.message)
    })
  }

  const submit = async () => {
    try {
      setLoading(true)
      const payload = {
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address
        },
        emergencyType,
        description,
        contactNumber
      }

      const res = await sosAPI.createSOSAlert(payload)
      if (res.data?.success) {
        toast.success('SOS alert sent. Help is on the way.')
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Emergency Support (SOS)</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select value={emergencyType} onChange={(e) => setEmergencyType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200">
              <option value="medical">Medical</option>
              <option value="accident">Accident</option>
              <option value="theft">Theft</option>
              <option value="lost">Lost</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 p-2" placeholder="+94..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 p-2" rows={3} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location (optional)</label>
            <div className="flex gap-2 mt-1">
              <input value={location.address} onChange={(e) => setLocation((l) => ({ ...l, address: e.target.value }))} className="flex-1 rounded-md border-gray-200 p-2" placeholder="Address or landmark" />
              <button onClick={tryGeolocation} type="button" className="btn btn-secondary">Use GPS</button>
            </div>
            {location.latitude && (
              <div className="text-xs text-gray-500 mt-1">Coords: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button onClick={submit} disabled={loading} className="btn btn-primary">{loading ? 'Sending...' : 'Send SOS'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SOSModal
