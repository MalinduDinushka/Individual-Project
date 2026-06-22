import { useState } from 'react'
import { feedbackAPI } from '../../api'
import { toast } from 'react-hot-toast'

const Star = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" className="text-amber-400">
    <path d="M12 .587l3.668 7.431L23.4 9.75l-5.6 5.457L19.335 24 12 19.897 4.665 24l1.535-8.793L.6 9.75l7.732-1.732L12 .587z" />
  </svg>
)

const RatingStars = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      {[1,2,3,4,5].map((i) => (
        <button type="button" key={i} onClick={() => onChange(i)} className="hover:scale-110 transition-transform">
          <Star filled={i <= value} />
        </button>
      ))}
    </div>
  )
}

const FeedbackForm = ({ booking, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [categories, setCategories] = useState({ serviceQuality: 5, communication: 5, valueForMoney: 5, cleanliness: 5 })
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!booking) return
    try {
      setSubmitting(true)
      await feedbackAPI.createFeedback({
        bookingId: booking._id,
        serviceId: booking.service || booking.serviceSnapshot?._id,
        providerId: booking.provider,
        rating,
        comment,
        categories
      })
      toast.success('Thanks — your feedback was submitted')
      onSubmitted && onSubmitted()
      onClose && onClose()
    } catch (err) {
      console.error('Submit feedback error', err)
      toast.error(err?.response?.data?.message || 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  const setCat = (key, val) => setCategories((c) => ({ ...c, [key]: val }))

  return (
    <form onSubmit={submit} className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Overall rating</label>
        <RatingStars value={rating} onChange={setRating} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600">Service quality</label>
          <RatingStars value={categories.serviceQuality} onChange={(v) => setCat('serviceQuality', v)} />
        </div>
        <div>
          <label className="block text-xs text-gray-600">Communication</label>
          <RatingStars value={categories.communication} onChange={(v) => setCat('communication', v)} />
        </div>
        <div>
          <label className="block text-xs text-gray-600">Value for money</label>
          <RatingStars value={categories.valueForMoney} onChange={(v) => setCat('valueForMoney', v)} />
        </div>
        <div>
          <label className="block text-xs text-gray-600">Cleanliness</label>
          <RatingStars value={categories.cleanliness} onChange={(v) => setCat('cleanliness', v)} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Comment (optional)</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className="input input-bordered w-full" placeholder="Share helpful details for future travelers (what worked, what could be improved)"></textarea>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
        <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Submitting...' : 'Submit feedback'}</button>
      </div>
    </form>
  )
}

export default FeedbackForm
