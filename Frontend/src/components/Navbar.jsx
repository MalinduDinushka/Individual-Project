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
    <nav className={`${isLight ? 'bg-white/95 backdrop-blur-md' : 'bg-primary'} shadow-lg sticky top-0 z-50 border-b ${isLight ? 'border-gray-100' : 'border-primary-dark'}`}>
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className={`${isLight ? 'bg-gradient-to-br from-primary to-primary-dark' : 'bg-white'} p-2.5 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200`}>
              <FaMapMarkerAlt className={`${isLight ? 'text-white' : 'text-primary'} text-xl`} />
            </div>
            <div>
              <h1 className={`${isLight ? 'text-primary' : 'text-white'} text-2xl font-bold tracking-tight`}>
                TourMate
              </h1>
              <p className={`${isLight ? 'text-gray-500' : 'text-white/70'} text-xs font-medium flex items-center space-x-1`}>
                <FaStar className="text-secondary text-[10px]" />
                <span>Explore Sri Lanka</span>
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <a
              href="#features"
              onClick={(e) => handleScroll(e, 'features')}
              className={`${isLight ? 'text-gray-700 hover:text-primary hover:bg-primary/5' : 'text-white/90 hover:text-white hover:bg-white/10'} px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer`}
            >
              Features
            </a>
            <a
              href="#services"
              onClick={(e) => handleScroll(e, 'services')}
              className={`${isLight ? 'text-gray-700 hover:text-primary hover:bg-primary/5' : 'text-white/90 hover:text-white hover:bg-white/10'} px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer`}
            >
              Services
            </a>
            <a
              href="#reviews"
              onClick={(e) => handleScroll(e, 'reviews')}
              className={`${isLight ? 'text-gray-700 hover:text-primary hover:bg-primary/5' : 'text-white/90 hover:text-white hover:bg-white/10'} px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer`}
            >
              Reviews
            </a>
            <a
              href="#about"
              onClick={(e) => handleScroll(e, 'about')}
              className={`${isLight ? 'text-gray-700 hover:text-primary hover:bg-primary/5' : 'text-white/90 hover:text-white hover:bg-white/10'} px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer`}
            >
              About
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-3">
            <Link 
              to="/login" 
              className={`hidden sm:flex items-center space-x-2 ${isLight ? 'text-primary hover:text-primary-dark' : 'text-white/90 hover:text-white'} font-medium transition-colors duration-200`}
            >
              <span>Sign In</span>
            </Link>
            <Link 
              to="/register" 
              className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
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
