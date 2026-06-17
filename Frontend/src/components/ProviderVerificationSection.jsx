import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import VerificationDocumentUpload from '../components/VerificationDocumentUpload'
import VerifiedBadge from '../components/VerifiedBadge'
import { authAPI } from '../api'

const ProviderVerificationSection = ({ user, onUpdate }) => {
  const [submitting, setSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const handleRequestVerification = async () => {
    if (!window.confirm('Submit for verification? An admin will review your documents.')) return

    setSubmitting(true)
    try {
      const res = await authAPI.requestVerification()
      toast.success(res.data.message || 'Verification request submitted')
      setRefreshing(true)
      // Trigger parent update
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error('Request verification error', err)
      toast.error(err.response?.data?.message || 'Failed to request verification')
    } finally {
      setSubmitting(false)
      setRefreshing(false)
    }
  }

  const hasNIC = user?.verificationDocuments?.some(d => d.documentType === 'nic' && d.url)
  const isPending = user?.verificationStatus === 'pending'
  const isVerified = user?.isVerified && user?.verificationStatus === 'verified'
  const isRejected = user?.verificationStatus === 'rejected'

  return (
    <div className="space-y-6">
      {/* Verification Status Display */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            Verification Status
            {isVerified && <VerifiedBadge isVerified={true} verificationStatus="verified" />}
          </h3>
          {isVerified && <span className="badge bg-green-100 text-green-800">Verified</span>}
          {isPending && <span className="badge bg-amber-100 text-amber-800">Pending Review</span>}
          {isRejected && <span className="badge bg-red-100 text-red-800">Rejected</span>}
          {!isVerified && !isPending && !isRejected && (
            <span className="badge bg-slate-100 text-slate-800">Not Verified</span>
          )}
        </div>

        {isVerified && (
          <div className="text-sm text-green-700 bg-green-50 p-3 rounded">
            ✓ Your account is verified. You can now list services and accept bookings.
          </div>
        )}

        {isPending && (
          <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded">
            ⏳ Your verification request is under review. This usually takes 24 hours.
          </div>
        )}

        {isRejected && (
          <div className="space-y-2">
            <div className="text-sm text-red-700 bg-red-50 p-3 rounded">
              ✗ Your verification was not approved.
            </div>
            {user?.verificationNotes && (
              <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                <strong>Reason:</strong> {user.verificationNotes}
              </div>
            )}
            <p className="text-sm text-slate-600">
              Please upload a clear image of your NIC and try again.
            </p>
          </div>
        )}
      </div>

      {/* Document Upload Section - Show if not verified or rejected */}
      {(!isVerified || isRejected) && (
        <VerificationDocumentUpload userRole="provider" onSuccess={handleRequestVerification} />
      )}

      {/* Submit for Verification Button */}
      {!isVerified && !isPending && hasNIC && (
        <button
          onClick={handleRequestVerification}
          disabled={submitting}
          className="w-full btn btn-primary"
        >
          {submitting ? 'Submitting...' : 'Submit for Verification'}
        </button>
      )}

      {/* Documents Uploaded Status */}
      {user?.verificationDocuments && user.verificationDocuments.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h4 className="font-semibold text-slate-900 mb-3">Uploaded Documents</h4>
          <div className="space-y-2">
            {user.verificationDocuments.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <div>
                  <span className="font-medium text-slate-900 capitalize block">
                    {doc.documentType.replace('_', ' ')}
                  </span>
                  <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded ${
                    doc.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : doc.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {doc.status}
                  </span>
                </div>
                {doc.url && (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm font-semibold"
                  >
                    View
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProviderVerificationSection
