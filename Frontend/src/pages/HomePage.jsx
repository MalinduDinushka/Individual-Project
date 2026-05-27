import { FaStar, FaMapMarkerAlt, FaCalendar, FaSearch, FaArrowRight, FaShieldAlt, FaGlobeAsia, FaRegClock } from 'react-icons/fa'
import { MdVerified } from 'react-icons/md'
import { BiCustomize, BiSupport } from 'react-icons/bi'
import { AiOutlineSafety } from 'react-icons/ai'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

const statCards = [
  { value: '500+', label: 'Verified providers' },
  { value: '50K+', label: 'Happy travelers' },
  { value: '4.9★', label: 'Average rating' }
]

const featureCards = [
  {
    icon: MdVerified,
    title: 'Verified Guides',
    description: 'Every provider goes through quality checks so travelers can book with confidence and peace of mind.',
    href: '/register',
    accent: 'from-sky-500 to-cyan-500',
    iconBg: 'from-sky-100 to-sky-50',
    textAccent: 'group-hover:text-sky-600',
    linkLabel: '100% Verified'
  },
  {
    icon: BiCustomize,
    title: 'Custom Tour Requests',
    description: 'Post your ideal itinerary and receive curated bids from providers who fit your trip style and budget.',
    href: '/register',
    accent: 'from-rose-500 to-pink-500',
    iconBg: 'from-rose-100 to-rose-50',
    textAccent: 'group-hover:text-rose-500',
    linkLabel: 'Personalized Assistance'
  },
  {
    icon: BiSupport,
    title: '24/7 SOS Support',
    description: 'Emergency assistance and multilingual help are always available when the journey needs extra care.',
    href: '/register',
    accent: 'from-emerald-500 to-teal-500',
    iconBg: 'from-emerald-100 to-emerald-50',
    textAccent: 'group-hover:text-emerald-600',
    linkLabel: 'Always Protected'
  }
]

const serviceCards = [
  { icon: FaMapMarkerAlt, title: 'Tour Guides', description: 'Certified local experts who know every hidden gem', accent: 'from-cyan-500 to-blue-500' },
  { icon: FaCalendar, title: 'Vehicles', description: 'Comfortable transport options for every budget', accent: 'from-emerald-500 to-green-500' },
  { icon: FaStar, title: 'Accommodation', description: 'Curated stays from luxury to budget-friendly', accent: 'from-fuchsia-500 to-pink-500' },
  { icon: AiOutlineSafety, title: 'Safari Tours', description: 'Wildlife adventures in national parks', accent: 'from-amber-500 to-orange-500' }
]

const testimonials = [
  {
    initials: 'SJ',
    name: 'Sarah Johnson',
    country: 'United Kingdom',
    flag: '🇬🇧',
    quote: 'TourMate made our Sri Lanka trip feel effortless. The guide quality, support, and booking flow were all exceptional.'
  },
  {
    initials: 'MC',
    name: 'Michael Chen',
    country: 'Singapore',
    flag: '🇸🇬',
    quote: 'The custom tour request feature is the best part. We received thoughtful bids and picked the perfect itinerary.'
  },
  {
    initials: 'EW',
    name: 'Emma Williams',
    country: 'Australia',
    flag: '🇦🇺',
    quote: 'We felt safe from the first day. Verified providers and 24/7 support made the whole journey premium and reliable.'
  }
]

const HomePage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar variant="light" />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{
              backgroundImage: 'url(/hero-bg.webp)',
              opacity: 0.45
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/75 via-primary/75 to-cyan-700/70"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.10),_transparent_24%)]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-24 md:py-32 lg:py-36">
          <div className="max-w-5xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md mb-8 shadow-lg">
              <FaShieldAlt className="text-amber-300" />
              <span className="text-sm font-semibold tracking-wide">Trusted by 10,000+ travelers</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.02] max-w-4xl mx-auto">
              Travel Sri Lanka with
              <span className="block mt-3 bg-gradient-to-r from-amber-200 via-white to-cyan-200 bg-clip-text text-transparent">
                confidence and style
              </span>
            </h1>

            <p className="mt-8 text-lg md:text-xl leading-8 text-white/85 max-w-3xl mx-auto">
              Discover premium guides, seamless trip planning, and safe travel support in one polished platform built for real journeys.
            </p>

            <div className="mt-10 premium-panel-soft p-4 md:p-5 max-w-4xl mx-auto bg-white/15 border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr_0.9fr_auto] gap-3 items-center">
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Where would you like to go?"
                    className="input pl-12 bg-white text-slate-800 border-white/20"
                  />
                </div>

                <div className="relative">
                  <FaCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    className="input pl-12 bg-white text-slate-800 border-white/20"
                  />
                </div>

                <select className="input bg-white text-slate-800 border-white/20">
                  <option>Service Type</option>
                  <option>Tour Guide</option>
                  <option>Vehicle</option>
                  <option>Accommodation</option>
                  <option>Safari</option>
                </select>

                <Link
                  to="/services"
                  className="btn btn-primary whitespace-nowrap px-7"
                >
                  <FaSearch />
                  <span>Explore Services</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-10 max-w-3xl mx-auto">
              {statCards.map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-md p-5 shadow-xl shadow-black/10">
                  <div className="text-3xl md:text-4xl font-extrabold">{stat.value}</div>
                  <div className="mt-1 text-sm text-white/75">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="py-24 md:py-28">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden premium-panel p-10 md:p-14 text-center max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(22,128,147,0.10),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.08),_transparent_25%)]"></div>
            <div className="relative z-10">
              <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AiOutlineSafety className="text-primary text-4xl" />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                Ready to start your next great trip?
              </h2>
              <p className="text-slate-600 text-lg max-w-3xl mx-auto mb-8 leading-8">
                Join thousands of travelers who use TourMate to discover Sri Lanka with better planning, trusted providers, and premium support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn btn-primary px-8">
                  Get Started Free
                </Link>
                <Link to="/services" className="btn btn-secondary px-8">
                  Explore Services
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

      {/* Features Section */}
      <section id="features" className="py-24 md:py-28 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="section-eyebrow mx-auto mb-5">
              <span>Trusted platform</span>
            </div>
            <h2 className="section-title">A better way to plan premium travel</h2>
            <p className="section-copy mt-5">
              TourMate combines verified providers, custom travel requests, and emergency support into one polished experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {featureCards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.title} className="group relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} rounded-[28px] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity`}></div>
                  <div className="relative premium-panel p-8 md:p-10 h-full group-hover:-translate-y-1 transition-transform duration-300">
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${card.iconBg} flex items-center justify-center mb-8 shadow-lg`}>
                      <Icon className={`text-4xl text-slate-900 ${card.textAccent}`} />
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-900 mb-4">{card.title}</h3>
                    <p className="text-slate-600 leading-7 mb-8 min-h-[88px]">{card.description}</p>
                    <Link
                      to={card.href}
                      className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark"
                    >
                      <span>{card.linkLabel}</span>
                      <FaArrowRight className="text-xs" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 md:py-28 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(135deg,theme(colors.slate.900)_25%,transparent_25%),linear-gradient(225deg,theme(colors.slate.900)_25%,transparent_25%),linear-gradient(45deg,theme(colors.slate.900)_25%,transparent_25%),linear-gradient(315deg,theme(colors.slate.900)_25%,#ffffff_25%)] bg-[length:36px_36px] bg-[position:0_0,0_18px,18px_-18px,-18px_0px]"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="section-eyebrow mx-auto mb-5">
              <span>Our services</span>
            </div>
            <h2 className="section-title">Everything you need for a refined journey</h2>
            <p className="section-copy mt-5">
              From expert guides to reliable transport and luxury stays, the platform brings all essential travel services together.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {serviceCards.map((service) => {
              const Icon = service.icon
              return (
                <div key={service.title} className="group relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.accent} rounded-[24px] opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                  <div className="relative premium-panel p-7 h-full group-hover:-translate-y-1 transition-transform duration-300">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.accent} flex items-center justify-center mb-6 shadow-lg`}>
                      <Icon className="text-white text-2xl" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 mb-3">{service.title}</h3>
                    <p className="text-slate-600 text-sm leading-7">{service.description}</p>
                    <div className="mt-5 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn more <FaArrowRight className="inline-block ml-1 text-xs" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-24 md:py-28 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="section-eyebrow mx-auto mb-5">
              <FaStar className="text-amber-400" />
              <span>Testimonials</span>
            </div>
            <h2 className="section-title">What travelers say about TourMate</h2>
            <p className="section-copy mt-5">
              Real experiences from travelers who planned Sri Lanka trips with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-cyan-600 rounded-[28px] opacity-0 group-hover:opacity-5 transition-opacity"></div>
                <div className="relative premium-panel p-8 md:p-9 h-full group-hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-amber-400 text-lg" />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-8 text-lg leading-8 relative z-10">
                    <span className="text-5xl text-primary/15 absolute -top-2 -left-2">"</span>
                    {testimonial.quote}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {testimonial.initials}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{testimonial.name}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <span>{testimonial.flag}</span> {testimonial.country}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-6 rounded-full premium-panel px-8 py-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-extrabold text-primary">4.9</div>
                <div className="flex flex-col items-start">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-amber-400 text-sm" />
                    ))}
                  </div>
                  <div className="text-xs text-slate-500">Average rating</div>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-slate-900">10,000+</div>
                <div className="text-xs text-slate-500">Happy travelers</div>
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-slate-900">24/7</div>
                <div className="text-xs text-slate-500">Support available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

