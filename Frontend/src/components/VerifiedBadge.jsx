import { FaCheckCircle } from 'react-icons/fa'

const VerifiedBadge = ({ isVerified, verificationStatus, size = 'sm' }) => {
  if (!isVerified || verificationStatus !== 'verified') return null

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className="inline-flex items-center gap-1 ml-1">
      <FaCheckCircle
        className={`${sizeClasses[size]} text-green-600`}
        title="Verified user"
      />
    </div>
  )
}

export default VerifiedBadge
