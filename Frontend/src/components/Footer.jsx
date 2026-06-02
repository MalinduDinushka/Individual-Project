import { Link } from 'react-router-dom'
import { FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(34,197,94,0.08),_transparent_34%),linear-gradient(225deg,_rgba(14,165,233,0.08),_transparent_30%)]"></div>
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center space-x-3 mb-5">
              <div className="bg-white/10 backdrop-blur p-2.5 rounded-lg border border-white/10">
                <FaMapMarkerAlt className="text-primary text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold">TourMate</h1>
                <p className="text-xs text-white/70 uppercase tracking-[0.18em]">Travel made simple</p>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-7 max-w-sm">
              A clean booking platform for transport, stays, guides, and travel support across Sri Lanka.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase tracking-[0.18em] text-white/80 mb-4">Services</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/services" className="hover:text-secondary transition">Tour Guides</Link></li>
              <li><Link to="/services" className="hover:text-secondary transition">Transport</Link></li>
              <li><Link to="/services" className="hover:text-secondary transition">Stays</Link></li>
              <li><Link to="/services" className="hover:text-secondary transition">Safari</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase tracking-[0.18em] text-white/80 mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/#about" className="hover:text-secondary transition">About</Link></li>
              <li><Link to="/services" className="hover:text-secondary transition">Support</Link></li>
              <li><Link to="/register" className="hover:text-secondary transition">Become a provider</Link></li>
              <li><Link to="/login" className="hover:text-secondary transition">Sign in</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm uppercase tracking-[0.18em] text-white/80 mb-4">Stay Connected</h3>
            <p className="text-sm text-white/70 mb-5 leading-7">
              Follow us for product updates and travel inspiration.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-white/8 p-3 rounded-lg border border-white/10 hover:bg-white/15 transition" aria-label="Facebook">
                <FaFacebook className="text-xl" />
              </a>
              <a href="#" className="bg-white/8 p-3 rounded-lg border border-white/10 hover:bg-white/15 transition" aria-label="Instagram">
                <FaInstagram className="text-xl" />
              </a>
              <a href="#" className="bg-white/8 p-3 rounded-lg border border-white/10 hover:bg-white/15 transition" aria-label="Twitter">
                <FaTwitter className="text-xl" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-white/55">© 2026 TourMate. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link to="/privacy" className="text-white/70 hover:text-white transition">Privacy Policy</Link>
            <Link to="/terms" className="text-white/70 hover:text-white transition">Terms of Service</Link>
            <Link to="/cookies" className="text-white/70 hover:text-white transition">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
