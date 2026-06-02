import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  FaArrowRight,
  FaCalendarAlt,
  FaCarSide,
  FaCheckCircle,
  FaClock,
  FaHeadset,
  FaHotel,
  FaMapMarkerAlt,
  FaRoute,
  FaSearch,
  FaStar,
  FaUsers,
  FaGlobe
} from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'

const stats = [
  { value: '500+', label: 'Verified providers' },
  { value: '25+', label: 'Districts covered' },
  { value: '4.9/5', label: 'Traveler rating' },
  { value: '24/7', label: 'Trip support' }
]

const searchFilters = ['Colombo', 'Ella', 'Kandy', 'Mirissa']

const services = [
  {
    icon: FaRoute,
    title: 'Local tour guides',
    description: 'Find guides for culture, wildlife, city walks, hill country routes, and custom itineraries.'
  },
  {
    icon: FaCarSide,
    title: 'Private transport',
    description: 'Book airport transfers, cars, vans, drivers, and route-based transport for your trip.'
  },
  {
    icon: FaHotel,
    title: 'Stays and villas',
    description: 'Compare guest houses, villas, hotels, and family-friendly stays with practical details.'
  },
  {
    icon: FaHeadset,
    title: 'Travel support',
    description: 'Use chat, booking updates, SOS access, and feedback tools before and after travel.'
  }
]

const workflow = [
  {
    icon: FaSearch,
    title: 'Search by destination',
    description: 'Filter by district, service type, date, budget, and traveler count.'
  },
  {
    icon: MdVerified,
    title: 'Compare trusted providers',
    description: 'Review service details, ratings, profiles, photos, and response quality.'
  },
  {
    icon: FaCalendarAlt,
    title: 'Book with confidence',
    description: 'Create bookings, manage trip requests, message providers, and leave feedback.'
  }
]

const highlights = [
  'Verified provider profiles',
  'Transparent service details',
  'Tourist, provider, and admin dashboards',
  'Reviews, chat, bookings, and SOS support'
]

const reviews = [
  {
    name: 'Sarah Johnson',
    role: 'Traveler from the UK',
    quote: 'TourMate made the trip feel organized from the first search to the final booking.'
  },
  {
    name: 'Michael Chen',
    role: 'Family traveler',
    quote: 'The service cards and provider details made it easy to compare options quickly.'
  },
  {
    name: 'Nimali Perera',
    role: 'Service provider',
    quote: 'The dashboard gives providers a clean way to manage requests, packages, and bookings.'
  }
]

const HomePage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section with Integrated Navbar */}
      <section className="relative min-h-screen overflow-hidden">
        <img
          src="/hero-bg.webp"
          alt="Sri Lankan travel"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/50 to-transparent" />

        {/* Navbar - Overlay */}
        <div className="absolute top-0 left-0 right-0 z-50">
          <Navbar variant="light" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 py-32 flex items-center min-h-screen">
          <div className="max-w-3xl pt-16">
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Discover Sri Lanka with <span className="text-cyan-300">TourMate</span>
            </h1>
            
            <p className="mt-8 text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl">
              Connect with verified guides, book transportation, find stays, and plan your perfect trip in one trusted platform.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <Link to="/services" className="btn btn-primary px-8 py-4 text-lg">
                Explore Services
                <FaArrowRight />
              </Link>
              <Link to="/register" className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold">
                Create Account
              </Link>
            </div>

            {/* Stats Row */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="backdrop-blur-sm bg-white/10 p-4 rounded-lg border border-white/20">
                  <div className="text-3xl md:text-4xl font-extrabold text-cyan-300">{stat.value}</div>
                  <p className="mt-2 text-white/80 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="mb-20 max-w-3xl">
            <div className="section-eyebrow mb-4">What We Offer</div>
            <h2 className="section-title">Complete travel solutions</h2>
            <p className="section-copy mt-4">
              Everything you need to plan, book, and enjoy an authentic travel experience across Sri Lanka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <div key={service.title} className="group">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary text-3xl transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                    <Icon />
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-slate-900">{service.title}</h3>
                  <p className="mt-3 text-slate-600 leading-relaxed">{service.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us - With Gradient Background */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-white to-slate-50">
        <div className="container mx-auto px-6">
          <div className="mb-20 max-w-3xl">
            <div className="section-eyebrow mb-4">Why TourMate</div>
            <h2 className="section-title">Built for real travelers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {highlights.map((item, idx) => (
                <div key={item} className="flex gap-4 group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white font-bold transition-transform group-hover:scale-110">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 group-hover:text-primary transition-colors">{item}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
              <img src="/map-sl.webp" alt="Sri Lanka map" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Dark Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <div className="mb-20 max-w-3xl">
            <div className="section-eyebrow mb-4 border-cyan-300/30 bg-cyan-300/10 text-cyan-300">Our Process</div>
            <h2 className="text-5xl font-extrabold mb-4">Simple booking process</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {workflow.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400 text-slate-900 text-2xl font-bold mb-6">
                    {index + 1}
                  </div>
                  {index < workflow.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-32 w-24 h-1 bg-cyan-400/30" />
                  )}
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-white/75 leading-relaxed">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Reviews - White Section */}
      <section id="reviews" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="mb-20 max-w-3xl mx-auto text-center">
            <div className="section-eyebrow mb-4 justify-center">Testimonials</div>
            <h2 className="section-title">What users say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div key={review.name} className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed mb-6">"{review.quote}"</p>
                <div className="flex items-center gap-3 pt-6 border-t border-slate-200">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-sm">
                    {review.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{review.name}</p>
                    <p className="text-sm text-slate-500">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Gradient */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary/95 to-primary/85">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-5xl font-extrabold mb-6">Ready to explore?</h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Start planning your Sri Lankan adventure today. Whether you're looking for guides, transport, or places to stay, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/services" className="btn bg-white text-primary hover:bg-slate-100 px-8 py-3 font-semibold">
                Browse Services
              </Link>
              <Link to="/register" className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-3 font-semibold">
                Sign Up Now
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
