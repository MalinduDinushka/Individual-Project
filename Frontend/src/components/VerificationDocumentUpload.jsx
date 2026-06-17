import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { authAPI } from '../api'

const VerificationDocumentUpload = ({ userRole, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')

  const documentType = userRole === 'tourist' ? 'passport' : 'nic'
  const documentLabel = userRole === 'tourist' ? 'Passport' : 'NIC (National ID)'

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
      setFile(selectedFile)
      setFileName(selectedFile.name)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('document', file)
      formData.append('documentType', documentType)

      // Use fetch directly for multipart
      const token = localStorage.getItem('tourmate-auth')
        ? JSON.parse(localStorage.getItem('tourmate-auth')).state?.token
        : null

      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${base}/auth/verification-documents`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || 'Upload failed')
      }

      toast.success('Document uploaded successfully!')
      setFile(null)
      setFileName('')
      if (onSuccess) onSuccess(data.data)
    } catch (err) {
      console.error('Upload error', err)
      toast.error(err.message || 'Failed to upload document')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Verification</h3>
      
      <div className="mb-4">
        <p className="text-sm text-slate-600 mb-3">
          To unlock full {userRole === 'tourist' ? 'booking' : 'service listing'} capabilities, please upload your {documentLabel.toLowerCase()} for verification.
        </p>
        <p className="text-xs text-slate-500 mb-4">
          Our admin team will review your {documentLabel.toLowerCase()} within 24 hours.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-2 block">
            Upload {documentLabel}
          </span>
          <div className="relative">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              disabled={loading}
              className="hidden"
              id="doc-upload"
            />
            <label
              htmlFor="doc-upload"
              className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary transition-colors"
            >
              {fileName ? (
                <span className="text-sm text-slate-700">{fileName}</span>
              ) : (
                <span className="text-sm text-slate-500">Click to select {documentLabel}</span>
              )}
            </label>
          </div>
        </label>

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full btn btn-primary"
        >
          {loading ? 'Uploading...' : 'Upload Document'}
        </button>

        <p className="text-xs text-slate-500">
          Supported formats: JPG, PNG, PDF (max 10MB)
        </p>
      </div>
    </div>
  )
}

export default VerificationDocumentUpload
