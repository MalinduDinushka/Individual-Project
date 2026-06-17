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
  FaStar,
  FaUsers,
  FaGlobe
} from 'react-icons/fa'

const stats = [
  { value: '500+', label: 'Verified providers' },
  { value: '25+', label: 'Districts covered' },
  { value: '4.9/5', label: 'Traveler rating' },
  { value: '24/7', label: 'Trip support' }
]

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
  return (
    <div className="min-h-screen bg-amber-50 text-slate-900">
      {/* Hero Section with Integrated Navbar */}
      <section className="relative min-h-screen overflow-hidden">
        <img
          src="/7397594.jpg"
          alt="Kalkudah beach scenery"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/70" />

        {/* Navbar */}
        <nav className="absolute top-0 left-0 right-0 z-50">
          <Navbar variant="dark" />
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex min-h-screen items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl text-center mx-auto">
              <p className="text-sm uppercase tracking-[0.55em] text-white/70 mb-6"></p>
              <h1 className="font-serif text-5xl md:text-[5.75rem] leading-[0.92] text-white drop-shadow-lg">Embrace<br />Barefoot Luxury</h1>
              <p className="mx-auto mt-8 max-w-2xl text-base md:text-lg text-white/80 leading-relaxed">
                Experience Sri Lanka’s coastline with tasteful stays, seamless local support, and a travel journey designed around your comfort.
              </p>
              <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-950/20 transition hover:bg-slate-100"
                >
                  Explore 
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Book your stay
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-10 left-6 text-xs uppercase tracking-[0.35em] text-white/60">
          
        </div>
      </section>

      {/* Our collection section with beige background */}
      <section className="py-24 bg-gradient-to-b from-orange-50/40 via-amber-50 to-orange-50/40">
        <div className="container mx-auto px-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.75fr] items-start mb-10">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.32em] text-cyan-500 font-semibold">Our collection</p>
              <h2 className="mt-4 text-4xl md:text-5xl font-extrabold text-slate-950 leading-tight">Stylish stays across Sri Lanka</h2>
              <p className="mt-5 text-lg text-slate-600 leading-relaxed">
                Discover thoughtfully selected accommodations for every style of travel. Each stay is verified, locally supported, and built for a seamless experience.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {['Beach escapes', 'Hill country', 'City stays', 'Eco retreats'].map((pill) => (
                  <button key={pill} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-cyan-300 hover:text-cyan-700">
                    {pill}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-500">Featured</p>
                  <h3 className="mt-3 text-2xl font-semibold text-slate-950">Stay with confidence</h3>
                </div>
                <span className="inline-flex rounded-full bg-cyan-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">
                  Verified
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-600 leading-7">
                Explore premium properties with high guest ratings, streamlined booking support, and proximity to Sri Lanka’s top destinations.
              </p>
              <div className="mt-5">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">24/7 support</p>
                  <p className="mt-2 text-sm text-slate-600">Live assistance available for every booking.</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/services" className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-400">
                  Browse all stays
                </Link>
                <Link to="/register" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100">
                  Become a host
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              { title: 'Kandy', location: 'Tea Country', image: '/1.webp', description: 'A serene hillside retreat with lush green views.', price: 'From $68/night' },
              { title: 'Mirissa', location: 'South Coast', image: '/2.webp', description: 'A beachside escape with sunset sea views.', price: 'From $74/night' },
              { title: '9 Arch', location: 'Ella', image: '/3.webp', description: 'A dramatic railway arch surrounded by rolling hills.', price: 'From $81/night' },
              { title: 'Trinco', location: 'East Coast', image: '/4.webp', description: 'A coastal hideaway beside turquoise waters.', price: 'From $79/night' }
            ].map((deal) => (
              <article key={deal.title} className="group overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.15)] transition hover:-translate-y-1 hover:shadow-[0_24px_64px_-24px_rgba(15,23,42,0.18)]">
                <div className="relative h-72 overflow-hidden">
                  <img src={deal.image} alt={deal.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/10 to-transparent" />
                  <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/95 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm">
                    {deal.location}
                  </div>
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-950">{deal.title}</h3>
                      <p className="mt-2 text-sm text-slate-500 leading-relaxed">{deal.description}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">{deal.price}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <FaStar className="text-amber-400" />
                    <span>4.9 · 38 reviews</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link to="/services" className="text-sm font-semibold text-cyan-600 transition hover:text-cyan-500">View details</Link>
                    <button className="ml-auto rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                      Book now
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-500">Explore Sri Lanka</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-4">Plan your journey with a beautiful island travel map</h2>
              <p className="mt-6 text-lg text-slate-600 max-w-2xl leading-relaxed">
                Discover key destinations, regional highlights, and route ideas for an unforgettable Sri Lankan adventure. Use the map to compare cultural hubs, coastline escapes, and hill country retreats.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {[
                  { icon: FaMapMarkerAlt, label: 'Top destinations' },
                  { icon: FaGlobe, label: 'Island-wide travel coverage' },
                  { icon: FaClock, label: 'Flexible itineraries' },
                  { icon: FaCheckCircle, label: 'Trusted local experts' }
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-start gap-3 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                      <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-600">
                        <Icon className="text-xl" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item.label}</p>
                        <p className="text-sm text-slate-500 mt-1">Curated travel insights for every trip.</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-[36px] bg-slate-900 shadow-2xl shadow-slate-900/10">
              <img src="/image.png" alt="Sri Lanka travel map" className="w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-24 bg-gradient-to-b from-amber-50 via-orange-50/30 to-amber-50">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-center mb-16">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-700 shadow-sm">
                What We Offer
              </div>
              <div>
                <h2 className="text-4xl font-extrabold text-slate-950">Complete travel solutions</h2>
                <p className="mt-4 text-lg text-slate-600 max-w-2xl leading-relaxed">
                  Everything you need to plan, book, and enjoy an authentic travel experience across Sri Lanka.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: 'Built for travelers', description: 'A clean, easy-to-use booking experience designed for modern explorers.' },
                { title: 'Trusted local providers', description: 'Verified listings paired with clear pricing and fast support.' }
              ].map((item) => (
                <div key={item.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <div key={service.title} className="group rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.2)] transition hover:-translate-y-1 hover:shadow-[0_32px_64px_-28px_rgba(15,23,42,0.18)]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-600 text-2xl transition duration-300 group-hover:bg-cyan-500 group-hover:text-white">
                    <Icon />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-slate-950">{service.title}</h3>
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
