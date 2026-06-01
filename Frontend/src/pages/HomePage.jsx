import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  FaArrowRight,
  FaCalendarAlt,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaHeadset,
  FaHotel,
  FaMapMarkedAlt,
  FaMotorcycle,
  FaRoute,
  FaSearch,
  FaShieldAlt,
  FaStar,
  FaTaxi,
  FaUsers
} from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'
import { BiCustomize } from 'react-icons/bi'
import { AiOutlineSafety } from 'react-icons/ai'

const stats = [
  { value: '500+', label: 'verified providers' },
  { value: '50K+', label: 'bookings completed' },
  { value: '4.9/5', label: 'average rating' },
  { value: '24/7', label: 'support' }
]

const trustPoints = ['Verified providers', 'Clear pricing', 'Chat and booking support']

const featuredServices = [
  {
    icon: FaRoute,
    title: 'Tour guides',
    description: 'Local guides with simple route planning and trip support.'
  },
  {
    icon: FaTaxi,
    title: 'Transport',
    description: 'Airport transfers, day trips, and private vehicle bookings.'
  },
  {
    icon: FaHotel,
    title: 'Stays',
    description: 'Hotels and guest stays with clear service details.'
  },
  {
    icon: FaMotorcycle,
    title: 'Safari & rides',
    description: 'Safari tours, ride options, and flexible travel experiences.'
  }
]

const workflow = [
  {
    title: 'Search simply',
    description: 'Choose a district, service type, and date.'
  },
  {
    title: 'Compare providers',
    description: 'Review quality, ratings, and booking details before you decide.'
  },
  {
    title: 'Book and review',
    description: 'Complete the trip and leave feedback after travel.'
  }
]

const reviews = [
  {
    name: 'Sarah Johnson',
    role: 'Traveler, UK',
    quote: 'It feels simple, clear, and easy to trust.'
  },
  {
    name: 'Michael Chen',
    role: 'Family traveler, SG',
    quote: 'The booking flow feels organized and modern.'
  },
  {
    name: 'Emma Williams',
    role: 'Solo traveler, AU',
    quote: 'The support and trust cues make booking feel comfortable.'
  }
]

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.06),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#f5f7fb_100%)] text-slate-900">
      <Navbar variant="light" />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.96),rgba(3,105,161,0.88)_52%,rgba(15,118,110,0.82))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_24%)]" />
          <div
            className="absolute inset-0 bg-cover bg-center mix-blend-soft-light opacity-20 scale-105"
            style={{ backgroundImage: 'url(/hero-bg.webp)' }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
            <div className="text-white max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md shadow-lg shadow-black/10">
                <MdVerified className="text-amber-300" />
                <span className="text-sm font-semibold tracking-wide">Travel booking platform for Sri Lanka</span>
              </div>

              <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[0.96]">
                Plan and book travel
                <span className="block mt-4 bg-gradient-to-r from-amber-200 via-white to-cyan-200 bg-clip-text text-transparent">
                  in one simple place
                </span>
              </h1>

              <p className="mt-6 text-lg md:text-xl leading-8 text-white/78 max-w-2xl">
                TourMate brings together guides, transport, stays, support, and reviews in one clean workflow.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/services" className="btn btn-primary px-8">
                  Explore services
                  <FaArrowRight />
                </Link>
                <Link to="/register" className="btn bg-white/10 text-white border border-white/15 hover:bg-white/15 px-8">
                  Create account
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/75">
                {trustPoints.map((item) => (
                  <div key={item} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 backdrop-blur-sm">
                    <FaCheckCircle className="text-emerald-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-white/12 bg-white/10 backdrop-blur-md p-5 shadow-xl shadow-black/10">
                    <div className="text-3xl md:text-4xl font-extrabold">{stat.value}</div>
                    <div className="mt-1 text-sm text-white/72 capitalize">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[34px] bg-cyan-400/20 blur-3xl" />
              <div className="relative rounded-[32px] border border-white/10 bg-slate-950/82 p-6 md:p-7 text-white shadow-[0_24px_90px_rgba(2,6,23,0.45)] backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/70 font-bold">Marketplace preview</div>
                    <h2 className="mt-2 text-2xl font-extrabold">A clean booking flow</h2>
                  </div>
                  <div className="rounded-2xl bg-emerald-400/15 border border-emerald-300/20 px-3 py-2 text-xs font-semibold text-emerald-200">
                    Live availability
                  </div>
                </div>

                <div className="mt-6 rounded-[28px] border border-white/10 bg-white/6 p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-[1.15fr_0.85fr] gap-4 items-center">
                    <div>
                      <div className="flex items-center gap-3 text-white/80">
                        <div className="w-11 h-11 rounded-2xl bg-cyan-400/15 flex items-center justify-center text-cyan-200">
                          <FaMapMarkedAlt />
                        </div>
                        <div>
                          <div className="font-semibold">Colombo to Ella</div>
                          <div className="text-sm text-white/55">District, route, and service filters</div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white/7 border border-white/10 p-4">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">Trip date</div>
                          <div className="mt-2 font-semibold flex items-center gap-2 text-sm"><FaCalendarAlt className="text-cyan-200" /> 12 May - 18 May</div>
                        </div>
                        <div className="rounded-2xl bg-white/7 border border-white/10 p-4">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">Support</div>
                          <div className="mt-2 font-semibold flex items-center gap-2 text-sm"><FaHeadset className="text-cyan-200" /> 24/7 help</div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[26px] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-4">
                      <div className="flex items-center justify-between text-sm text-white/70">
                        <span>Provider score</span>
                        <span className="inline-flex items-center gap-1 text-amber-300 font-semibold"><FaStar /> 4.9</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" />
                      </div>
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-3 rounded-2xl bg-white/7 border border-white/10 p-3">
                          <div className="w-10 h-10 rounded-xl bg-sky-400/15 flex items-center justify-center text-sky-200"><MdVerified /></div>
                          <div>
                            <div className="font-semibold text-sm">Verified profile</div>
                            <div className="text-xs text-white/55">Identity and service checks passed</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl bg-white/7 border border-white/10 p-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-400/15 flex items-center justify-center text-emerald-200"><FaClock /></div>
                          <div>
                            <div className="font-semibold text-sm">Fast response</div>
                            <div className="text-xs text-white/55">Chat before you book</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-cyan-500/12 border border-cyan-300/15 p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm text-cyan-100/70">Next best action</div>
                      <div className="mt-1 font-semibold">Compare providers by rating, response time, and booking details</div>
                    </div>
                    <FaChartLine className="text-2xl text-cyan-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <div className="section-eyebrow mb-5"><span>Built like a marketplace</span></div>
            <h2 className="section-title">A simple platform for booking travel services</h2>
            <p className="section-copy mt-5">
              Search, compare, chat, book, and review in a flow that is easy to use on desktop and mobile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {workflow.map((step, index) => (
              <div key={step.title} className="premium-panel p-7">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-lg">
                    0{index + 1}
                  </div>
                  {index < workflow.length - 1 && <FaArrowRight className="text-slate-300 hidden md:block" />}
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-slate-600 leading-7">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6 items-stretch">
            <div className="premium-panel p-7 md:p-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center"><FaUsers /></div>
                <div>
                  <div className="font-bold text-slate-900">Trust by design</div>
                  <div className="text-sm text-slate-500">Verified profiles and reviews</div>
                </div>
              </div>
              <p className="mt-5 text-slate-600 leading-7">
                The platform uses clear profile and feedback cues so users can make decisions more easily.
              </p>
            </div>

            <div className="premium-panel p-7 md:p-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><BiCustomize className="text-xl" /></div>
                <div>
                  <div className="font-bold text-slate-900">Structured feedback</div>
                  <div className="text-sm text-slate-500">Service quality, communication, and value</div>
                </div>
              </div>
              <p className="mt-5 text-slate-600 leading-7">
                The feedback system keeps ratings simple while still giving useful detail.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-20 md:py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(135deg,theme(colors.slate.900)_25%,transparent_25%),linear-gradient(225deg,theme(colors.slate.900)_25%,transparent_25%),linear-gradient(45deg,theme(colors.slate.900)_25%,transparent_25%),linear-gradient(315deg,theme(colors.slate.900)_25%,#ffffff_25%)] bg-[length:36px_36px] bg-[position:0_0,0_18px,18px_-18px,-18px_0px]" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="section-eyebrow mx-auto mb-5"><span>Services</span></div>
            <h2 className="section-title">The main services in one place</h2>
            <p className="section-copy mt-5">Simple categories, clear labels, and less visual noise.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.title} className="group premium-panel p-7 hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary/10 to-cyan-500/10 flex items-center justify-center text-primary shadow-sm mb-6 group-hover:scale-105 transition-transform">
                    <Icon className="text-2xl" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">{card.title}</h3>
                  <p className="mt-3 text-slate-600 leading-7">{card.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="reviews" className="py-20 md:py-24 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_24%)]" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200 mb-5">
              <FaShieldAlt />
              <span>Reviews</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">What travelers say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((item) => (
              <div key={item.name} className="rounded-[28px] border border-white/10 bg-white/6 backdrop-blur-md p-7 shadow-xl shadow-black/10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-cyan-100">
                    {item.name.split(' ').map((part) => part[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-sm text-white/60">{item.role}</div>
                  </div>
                </div>
                <p className="text-white/80 leading-8">“{item.quote}”</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20 md:py-24">
        <div className="container mx-auto px-6">
          <div className="premium-panel p-10 md:p-14 text-center max-w-5xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(22,128,147,0.10),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_25%)]" />
            <div className="relative z-10">
              <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AiOutlineSafety className="text-primary text-4xl" />
              </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                Ready to plan your next trip?
              </h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto mb-8 leading-8">
                Search services, book with confidence, and manage support, chat, and feedback in one app.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn btn-primary px-8">
                  Create account
                </Link>
                <Link to="/services" className="btn btn-secondary px-8">
                  Browse services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default HomePage