import { FaStar, FaMapMarkerAlt, FaCalendar, FaSearch } from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'
import { BiCustomize, BiSupport } from 'react-icons/bi'
import { AiOutlineSafety } from 'react-icons/ai'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Navbar variant="light" />

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Image with Opacity */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/hero-bg.webp)',
            opacity: 0.55
          }}
        ></div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 to-primary-dark/70"></div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <FaStar className="text-secondary mr-2" />
            <span className="text-white text-sm font-medium">Trusted by 10,000+ Travelers</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Discover the Pearl of the
            <span className="text-secondary block mt-2">Indian Ocean</span>
          </h1>

          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-12">
            Connect with verified guides, request custom tours, and explore Sri Lanka's breathtaking beauty with complete confidence and safety
          </p>

          {/* Search Widget */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Where to?"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="relative">
                <FaCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Service Type</option>
                <option>Tour Guide</option>
                <option>Vehicle</option>
                <option>Accommodation</option>
                <option>Safari</option>
              </select>
            </div>

            <button className="w-full btn btn-primary flex items-center justify-center space-x-2">
              <FaSearch />
              <span>Explore Services</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-white/80">Verified Providers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-white/80">Happy Travelers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">4.9★</div>
              <div className="text-white/80">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-primary/5 px-5 py-2 rounded-full mb-6 shadow-sm">
              <span className="text-primary font-bold text-sm tracking-wide uppercase">Trusted Platform</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Journey, Our Priority
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience Sri Lanka like never before with our comprehensive travel platform, designed for safety, convenience, and unforgettable memories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Verified Guides Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl transform transition-transform group-hover:scale-105 opacity-0 group-hover:opacity-100 blur-xl"></div>
              <div className="relative bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:-translate-y-2">
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 transform transition-transform group-hover:rotate-6 group-hover:scale-110 shadow-lg">
                  <MdVerified className="text-primary text-4xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">
                  Verified Guides
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6 min-h-[96px]">
                  All tour providers are thoroughly verified, background-checked, and meet our strict quality standards.
                </p>
                <Link 
                  to="/register" 
                  className="inline-flex items-center text-primary font-semibold text-sm group-hover:gap-2 transition-all"
                >
                  <span>100% Verified</span>
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>

            {/* Custom Tour Requests Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl transform transition-transform group-hover:scale-105 opacity-0 group-hover:opacity-100 blur-xl"></div>
              <div className="relative bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:-translate-y-2">
                <div className="bg-gradient-to-br from-red-100 to-pink-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 transform transition-transform group-hover:rotate-6 group-hover:scale-110 shadow-lg">
                  <BiCustomize className="text-red-500 text-4xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-red-500 transition-colors">
                  Custom Tour Requests
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6 min-h-[96px]">
                  Post your dream itinerary and receive personalized, competitive bids from multiple verified providers.
                </p>
                <Link 
                  to="/register" 
                  className="inline-flex items-center text-red-500 font-semibold text-sm group-hover:gap-2 transition-all"
                >
                  <span>Personalized Assistance</span>
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>

            {/* 24/7 SOS Support Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl transform transition-transform group-hover:scale-105 opacity-0 group-hover:opacity-100 blur-xl"></div>
              <div className="relative bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:-translate-y-2">
                <div className="bg-gradient-to-br from-green-100 to-emerald-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 transform transition-transform group-hover:rotate-6 group-hover:scale-110 shadow-lg">
                  <BiSupport className="text-green-600 text-4xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                  24/7 SOS Support
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6 min-h-[96px]">
                  Round-the-clock emergency assistance in multiple languages ensures your safety at every step.
                </p>
                <Link 
                  to="/register" 
                  className="inline-flex items-center text-green-600 font-semibold text-sm group-hover:gap-2 transition-all"
                >
                  <span>Always Protected</span>
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-primary/5 px-5 py-2 rounded-full mb-6 shadow-sm">
              <span className="text-primary font-bold text-sm tracking-wide uppercase">Our Services</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Everything You Need for Your Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From expert tour guides to comfortable accommodations, we connect you with the best service providers in Sri Lanka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Tour Guides */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:-translate-y-2">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg">
                  <FaMapMarkerAlt className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">Tour Guides</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Certified local experts who know every hidden gem</p>
                <div className="mt-4 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">Learn more →</div>
              </div>
            </div>

            {/* Vehicles */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:-translate-y-2">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg">
                  <FaCalendar className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">Vehicles</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Comfortable transport options for every budget</p>
                <div className="mt-4 text-sm font-medium text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">Learn more →</div>
              </div>
            </div>

            {/* Accommodation */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:-translate-y-2">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg">
                  <FaStar className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">Accommodation</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Curated stays from luxury to budget-friendly</p>
                <div className="mt-4 text-sm font-medium text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">Learn more →</div>
              </div>
            </div>

            {/* Safari Tours */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:-translate-y-2">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg">
                  <AiOutlineSafety className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">Safari Tours</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Wildlife adventures in national parks</p>
                <div className="mt-4 text-sm font-medium text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">Learn more →</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-gradient-to-r from-secondary/10 to-secondary/5 px-5 py-2 rounded-full mb-6 shadow-sm">
              <FaStar className="text-secondary mr-2" />
              <span className="text-secondary font-bold text-sm tracking-wide uppercase">Testimonials</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              What Travelers Say About Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Real experiences from real travelers who explored Sri Lanka with TourMate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Testimonial 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
              <div className="relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:-translate-y-2">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/10 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-secondary text-lg" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed relative z-10">
                  <span className="text-5xl text-primary/20 absolute -top-2 -left-2">"</span>
                  TourMate made our Sri Lanka trip absolutely perfect. Our guide was knowledgeable and the whole process was seamless!
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    SJ
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Sarah Johnson</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <span>🇬🇧</span> United Kingdom
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
              <div className="relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:-translate-y-2">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/10 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-secondary text-lg" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed relative z-10">
                  <span className="text-5xl text-primary/20 absolute -top-2 -left-2">"</span>
                  The custom tour request feature is brilliant. Got competitive quotes and chose the perfect itinerary for our family.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    MC
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Michael Chen</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <span>🇸🇬</span> Singapore
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
              <div className="relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:-translate-y-2">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/10 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-secondary text-lg" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed relative z-10">
                  <span className="text-5xl text-primary/20 absolute -top-2 -left-2">"</span>
                  Felt safe throughout our journey. The 24/7 support and verified guides gave us complete peace of mind.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    EW
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Emma Williams</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <span>🇦🇺</span> Australia
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-6 bg-white px-8 py-4 rounded-full shadow-lg">
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-primary">4.9</div>
                <div className="flex flex-col items-start">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-secondary text-sm" />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">Average Rating</div>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">10,000+</div>
                <div className="text-xs text-gray-500">Happy Travelers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About/CTA Section */}
      <section id="about" className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-3xl mx-auto">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AiOutlineSafety className="text-primary text-4xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-gray-600 mb-8">
              Join thousands of travelers who have discovered Sri Lanka's magic through TourMate. Your perfect journey is just one click away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn btn-primary">
                Get Started Free
              </Link>
              <Link to="/services" className="btn btn-outline">
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default HomePage
