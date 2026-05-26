import { Link } from 'react-router-dom'
import { FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.12),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.10),_transparent_24%)]"></div>
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-3 mb-5">
              <div className="bg-white/10 backdrop-blur p-2.5 rounded-2xl border border-white/10">
                <FaMapMarkerAlt className="text-primary text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold">TourMate</h1>
                <p className="text-xs text-white/70 uppercase tracking-[0.18em]">Explore Sri Lanka</p>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-7 max-w-sm">
              Your trusted companion for exploring the pearl of the Indian Ocean with safety and confidence.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-[0.18em] text-white/80 mb-4">Services</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/services/guides" className="hover:text-secondary transition">Tour Guides</Link></li>
              <li><Link to="/services/vehicles" className="hover:text-secondary transition">Luxury Vehicles</Link></li>
              <li><Link to="/services/villas" className="hover:text-secondary transition">Villa Accommodations</Link></li>
              <li><Link to="/services/safari" className="hover:text-secondary transition">Safari Adventures</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-[0.18em] text-white/80 mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/about" className="hover:text-secondary transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-secondary transition">Contact Support</Link></li>
              <li><Link to="/careers" className="hover:text-secondary transition">Careers</Link></li>
              <li><Link to="/press" className="hover:text-secondary transition">Press Kit</Link></li>
            </ul>
          </div>

          {/* Stay Connected */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-[0.18em] text-white/80 mb-4">Stay Connected</h3>
            <p className="text-sm text-white/70 mb-5 leading-7">
              Follow us on social media for travel inspiration
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-white/8 p-3 rounded-2xl border border-white/10 hover:bg-white/15 transition">
                <FaFacebook className="text-xl" />
              </a>
              <a href="#" className="bg-white/8 p-3 rounded-2xl border border-white/10 hover:bg-white/15 transition">
                <FaInstagram className="text-xl" />
              </a>
              <a href="#" className="bg-white/8 p-3 rounded-2xl border border-white/10 hover:bg-white/15 transition">
                <FaTwitter className="text-xl" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-white/55">
            © 2026 TourMate. All rights reserved. Made with ❤️ for travelers.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
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
