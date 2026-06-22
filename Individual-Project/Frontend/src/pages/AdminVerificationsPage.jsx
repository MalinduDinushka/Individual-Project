import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { authAPI } from '../api'

const AdminVerificationsPage = () => {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPending()
  }, [])

  const fetchPending = async () => {
    setLoading(true)
    try {
      const res = await authAPI.getPendingVerifications()
      setPending(res.data.data.pending || [])
    } catch (err) {
      console.error('Fetch pending error', err)
      toast.error('Failed to fetch pending verifications')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId) => {
    if (!window.confirm('Approve this user?')) return

    setSubmitting(true)
    try {
      await authAPI.approveVerification(userId, { notes: reviewNotes || 'Approved' })
      toast.success('User approved and verified')
      setSelectedUser(null)
      setReviewNotes('')
      await fetchPending()
    } catch (err) {
      console.error('Approve error', err)
      toast.error(err.response?.data?.message || 'Failed to approve')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async (userId) => {
    if (!reviewNotes.trim()) {
      toast.error('Please provide rejection notes')
      return
    }
    if (!window.confirm('Reject this user?')) return

    setSubmitting(true)
    try {
      await authAPI.rejectVerification(userId, { notes: reviewNotes })
      toast.success('User rejected')
      setSelectedUser(null)
      setReviewNotes('')
      await fetchPending()
    } catch (err) {
      console.error('Reject error', err)
      toast.error(err.response?.data?.message || 'Failed to reject')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="page-shell py-20 text-center">Loading pending verifications...</div>
  }

  return (
    <div className="page-shell py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Pending Verifications</h1>

        {pending.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <p className="text-slate-600">No pending verifications</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pending.map((user) => (
              <div
                key={user._id}
                className="premium-panel p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedUser(selectedUser === user._id ? null : user._id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{user.name}</h3>
                    <p className="text-sm text-slate-600">{user.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    Requested:{' '}
                    {new Date(user.verificationRequestedAt).toLocaleDateString()}
                  </div>
                </div>

                {selectedUser === user._id && (
                  <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">
                        Documents ({user.verificationDocuments?.length || 0})
                      </h4>
                      {user.verificationDocuments && user.verificationDocuments.length > 0 ? (
                        <ul className="space-y-2">
                          {user.verificationDocuments.map((doc, idx) => (
                            <li key={idx} className="text-sm">
                              <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                                <div>
                                  <span className="font-medium text-slate-900 capitalize">
                                    {doc.documentType.replace('_', ' ')}
                                  </span>
                                  <p className="text-xs text-slate-500 mt-1">
                                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                {doc.url && (
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-sm font-semibold"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View
                                  </a>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-500">No documents uploaded</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Review Notes
                      </label>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Enter review notes or rejection reason..."
                        className="w-full input min-h-[100px]"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApprove(user._id)
                        }}
                        disabled={submitting}
                        className="flex-1 btn bg-green-600 hover:bg-green-700 text-white"
                      >
                        {submitting ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReject(user._id)
                        }}
                        disabled={submitting}
                        className="flex-1 btn bg-red-600 hover:bg-red-700 text-white"
                      >
                        {submitting ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminVerificationsPage
