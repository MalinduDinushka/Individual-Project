import { Link, useLocation } from 'react-router-dom'
import { FaStar } from 'react-icons/fa'
import { MdArrowForward } from 'react-icons/md'
import Logo from './Logo'

const Navbar = ({ variant = 'light' }) => {
  const isLight = variant === 'light'
  const isHero = variant === 'hero'
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
    <nav className={`${isHero ? 'bg-slate-950/20 border-white/10' : isLight ? 'bg-white/90 border-slate-200/70 shadow-sm' : 'bg-slate-900/50 border-white/5'} backdrop-blur-2xl sticky top-0 z-50 border-b`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Logo compact={isHero} className="group" />

          {/* Navigation Links */}
          <div className={`${isHero ? 'hidden' : isLight ? 'bg-slate-100/80' : 'bg-white/10'} ${isHero ? '' : 'hidden md:flex'} items-center space-x-1 rounded-full px-2 py-1`}>
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
            {!isHero && (
              <Link 
                to="/login" 
                className={`hidden sm:flex items-center space-x-2 ${isLight ? 'text-slate-700 hover:text-slate-900' : 'text-white/80 hover:text-white'} font-semibold transition-colors duration-200`}
              >
                <span>Sign In</span>
              </Link>
            )}
            <Link 
              to="/register" 
              className={`${isHero ? 'text-white/90 bg-white/10 border border-white/20 hover:bg-white/15' : 'text-white bg-primary hover:bg-primary-dark'} flex items-center space-x-2 px-5 py-2.5 rounded-full font-semibold shadow-sm transition-all duration-200 ${!isHero ? 'hover:-translate-y-0.5' : ''}`}
            >
              <span>{isHero ? 'BOOK' : 'Join Now'}</span>
              {!isHero && <MdArrowForward className="text-lg" />}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
