import { Link } from 'react-router-dom'
import { useState } from 'react'
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
  FaUsers,
  FaGlobe
} from 'react-icons/fa'

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

/* Workflow section removed */

const highlights = [
  'Verified provider profiles',
  'Transparent service details',
  'Tourist, provider, and admin dashboards',
  'Reviews, chat, bookings, and SOS support'
]


const HomePage = () => {
  const [activeTab, setActiveTab] = useState('guides')

  const tabs = [
    { id: 'guides', label: 'Tour Guides', icon: FaRoute },
    { id: 'transport', label: 'Transport', icon: FaCarSide },
    { id: 'stays', label: 'Stays', icon: FaHotel },
    { id: 'packages', label: 'Packages', icon: FaCalendarAlt },
    { id: 'support', label: 'Support', icon: FaHeadset }
  ]

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero Section with Integrated Navbar */}
      <section className="relative min-h-screen overflow-hidden">
        <img
          src="/hero-bg.webp"
          alt="Sri Lankan travel"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/75 via-slate-900/55 to-slate-900/30" />

        {/* Navbar */}
        <nav className="absolute top-0 left-0 right-0 z-50">
          <Navbar variant="dark" />
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 pt-32 pb-20">
          <div className="max-w-5xl">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Find the right travel experience for you
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
              Compare and book guides, transport, stays, and travel packages from trusted providers across Sri Lanka.
            </p>

            {/* Search Card */}
            <div className="mt-12 bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Category Tabs */}
              <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-200 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex flex-col items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="text-xl" />
                      <span className="text-xs font-semibold">{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Search Form */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">From</label>
                    <input type="text" placeholder="Colombo" className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">To</label>
                    <input type="text" placeholder="Enter destination" className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                    <input type="date" className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Travelers</label>
                    <select className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option>1 person</option>
                      <option>2 people</option>
                      <option>3-4 people</option>
                      <option>5+ people</option>
                    </select>
                  </div>
                </div>
                <button className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark transition-colors">Search</button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl md:text-4xl font-extrabold text-cyan-300">{stat.value}</div>
                  <p className="mt-2 text-white/80 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Travel Deals Section - card style */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">Travel deals under $367</h2>
              <p className="text-slate-600">Curated trips and popular destinations</p>
            </div>
            <Link to="/services" className="inline-flex items-center gap-2 font-semibold text-primary hover:text-primary-dark transition-colors">
              Explore more <FaArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Kandy', image: '/1.webp', duration: '1h 25m, non-stop', dates: 'Fri 7/17  ›  Fri 7/24', price: '$202' },
              { title: 'Mirissa', image: '/2.webp', duration: '2h 50m, non-stop', dates: 'Wed 7/1  ›  Sat 7/4', price: '$264' },
              { title: '9 Arch', image: '/3.webp', duration: '1h 10m, non-stop', dates: 'Thu 7/9  ›  Sun 7/12', price: '$276' },
              { title: 'Trinco', image: '/4.webp', duration: '2h, non-stop', dates: 'Fri 7/17  ›  Fri 7/24', price: '$282' }
            ].map((deal) => (
              <article
                key={deal.title}
                className="rounded-2xl bg-white shadow-sm hover:shadow-md border border-slate-100 overflow-hidden transition-shadow duration-200"
              >
                <img src={deal.image} alt={deal.title} className="w-full h-44 md:h-52 object-cover rounded-t-2xl" />

                <div className="p-6">
                  <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">{deal.title}</h3>
                  <div className="text-sm text-slate-600 mb-2">{deal.duration}</div>
                  <div className="text-sm text-slate-500 mb-4">{deal.dates}</div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-sm text-slate-600">from</div>
                    <div className="text-xl md:text-2xl font-extrabold text-slate-900">{deal.price}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="mb-20 max-w-3xl">
            <div className="section-eyebrow mb-4">What We Offer</div>
            <h2 className="section-title">Complete travel solutions</h2>
            <p className="section-copy mt-4">Everything you need to plan, book, and enjoy an authentic travel experience across Sri Lanka.</p>
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

      {/* How It Works section removed per request */}

      {/* Testimonials removed per request */}

      {/* Final CTA (system UI friendly) */}
      <section className="py-20 bg-gradient-to-br from-primary/85 to-primary/65">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">Ready to explore?</h2>
            <p className="text-base md:text-lg text-white/95 mb-6 leading-relaxed">Start planning your Sri Lankan adventure today. Whether you're looking for guides, transport, or places to stay, we've got you covered.</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/services"
                className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-white text-primary font-medium shadow-sm hover:shadow transition-shadow"
              >
                Browse Services
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-white bg-transparent text-white font-medium hover:bg-white/10"
              >
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
