import { Link } from 'react-router-dom'
import { FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-white p-2 rounded-full">
                <FaMapMarkerAlt className="text-primary text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold">TourMate</h1>
                <p className="text-xs text-white/80">Explore Sri Lanka</p>
              </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Your trusted companion for exploring the pearl of the Indian Ocean with safety and confidence.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/services/guides" className="hover:text-secondary transition">Tour Guides</Link></li>
              <li><Link to="/services/vehicles" className="hover:text-secondary transition">Luxury Vehicles</Link></li>
              <li><Link to="/services/villas" className="hover:text-secondary transition">Villa Accommodations</Link></li>
              <li><Link to="/services/safari" className="hover:text-secondary transition">Safari Adventures</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-secondary transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-secondary transition">Contact Support</Link></li>
              <li><Link to="/careers" className="hover:text-secondary transition">Careers</Link></li>
              <li><Link to="/press" className="hover:text-secondary transition">Press Kit</Link></li>
            </ul>
          </div>

          {/* Stay Connected */}
          <div>
            <h3 className="font-bold text-lg mb-4">Stay Connected</h3>
            <p className="text-sm text-white/80 mb-4">
              Follow us on social media for travel inspiration
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition">
                <FaFacebook className="text-xl" />
              </a>
              <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition">
                <FaInstagram className="text-xl" />
              </a>
              <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition">
                <FaTwitter className="text-xl" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-white/60">
            © 2026 TourMate. All rights reserved. Made with ❤️ for travelers.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-white/80 hover:text-white transition">Privacy Policy</Link>
            <Link to="/terms" className="text-white/80 hover:text-white transition">Terms of Service</Link>
            <Link to="/cookies" className="text-white/80 hover:text-white transition">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
