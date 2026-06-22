import { FaCheckCircle } from 'react-icons/fa'

const VerifiedBadge = ({ isVerified, verificationStatus, size = 'sm' }) => {
  if (!isVerified || verificationStatus !== 'verified') return null

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-lg ring-2 ring-sky-200 ${sizeClasses[size]}`}
      title="Verified user"
    >
      <div className="inline-flex items-center justify-center rounded-full bg-white/15 p-1">
        <FaCheckCircle className="w-4 h-4" />
      </div>
    </div>
  )
}

export default VerifiedBadge
