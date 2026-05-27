import { Link, useLocation } from 'react-router-dom'
import { FaMapMarkerAlt, FaStar } from 'react-icons/fa'
import { MdArrowForward } from 'react-icons/md'

const Navbar = ({ variant = 'light' }) => {
  const isLight = variant === 'light'
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  const handleScroll = (e, sectionId) => {
    e.preventDefault()
    if (!isHomePage) {
      window.location.href = `/#${sectionId}`
      return
    }
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav className={`${isLight ? 'bg-white/80 backdrop-blur-xl border-b border-white/70 shadow-[0_12px_40px_rgba(15,23,42,0.08)]' : 'bg-slate-950/75 backdrop-blur-xl border-b border-white/10 shadow-[0_12px_40px_rgba(15,23,42,0.22)]'} sticky top-0 z-50`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className={`${isLight ? 'bg-gradient-to-br from-primary to-primary-dark' : 'bg-white'} p-2.5 rounded-2xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-200`}>
              <FaMapMarkerAlt className={`${isLight ? 'text-white' : 'text-primary'} text-xl`} />
            </div>
            <div>
              <h1 className={`${isLight ? 'text-slate-900' : 'text-white'} text-2xl font-extrabold tracking-tight`}>
                TourMate
              </h1>
              <p className={`${isLight ? 'text-slate-500' : 'text-white/70'} text-xs font-medium flex items-center space-x-1`}>
                <FaStar className="text-amber-400 text-[10px]" />
                <span>Premium travel platform</span>
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className={`${isLight ? 'bg-slate-100/80' : 'bg-white/10'} hidden md:flex items-center space-x-1 rounded-full px-2 py-1`}>
            <a
              href="#features"
              onClick={(e) => handleScroll(e, 'features')}
              className={`${isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-white' : 'text-white/85 hover:text-white hover:bg-white/10'} px-4 py-2 rounded-full font-medium transition-all duration-200 cursor-pointer`}
            >
              Features
            </a>
            <a
              href="#services"
              onClick={(e) => handleScroll(e, 'services')}
              className={`${isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-white' : 'text-white/85 hover:text-white hover:bg-white/10'} px-4 py-2 rounded-full font-medium transition-all duration-200 cursor-pointer`}
            >
              Services
            </a>
            <a
              href="#reviews"
              onClick={(e) => handleScroll(e, 'reviews')}
              className={`${isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-white' : 'text-white/85 hover:text-white hover:bg-white/10'} px-4 py-2 rounded-full font-medium transition-all duration-200 cursor-pointer`}
            >
              Reviews
            </a>
            <a
              href="#about"
              onClick={(e) => handleScroll(e, 'about')}
              className={`${isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-white' : 'text-white/85 hover:text-white hover:bg-white/10'} px-4 py-2 rounded-full font-medium transition-all duration-200 cursor-pointer`}
            >
              About
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-3">
            <Link 
              to="/login" 
              className={`hidden sm:flex items-center space-x-2 ${isLight ? 'text-slate-700 hover:text-slate-900' : 'text-white/80 hover:text-white'} font-semibold transition-colors duration-200`}
            >
              <span>Sign In</span>
            </Link>
            <Link 
              to="/register" 
              className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-2.5 rounded-2xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>Get Started</span>
              <MdArrowForward className="text-lg" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
