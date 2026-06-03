import { Link } from 'react-router-dom'

const Logo = ({
  to = '/',
  compact = false,
  className = '',
  textClassName = 'text-slate-900',
  iconContainerClassName = 'bg-white/10',
  imageClassName = 'w-10 h-10 rounded-2xl object-cover'
}) => (
  <Link to={to} className={`inline-flex items-center gap-3 ${className}`}>
    <div className={`flex items-center justify-center w-12 h-12 rounded-[1.25rem] shadow-lg shadow-slate-200/10 ring-1 ring-slate-900/5 ${iconContainerClassName}`}>
      <img src="/logo.png" alt="TourMate logo" className={imageClassName} />
    </div>
    {!compact && (
      <span className={`text-2xl font-extrabold tracking-tight ${textClassName}`}>TourMate</span>
    )}
  </Link>
)

export default Logo
