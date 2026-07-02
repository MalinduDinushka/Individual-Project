import { FiMoon, FiSun } from 'react-icons/fi'
import { useThemeStore } from '../../store/themeStore'

const TouristSettingsPage = () => {
  const theme = useThemeStore(state => state.theme)
  const setTheme = useThemeStore(state => state.setTheme)

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className="section-eyebrow">Settings</p>
        <h1 className="mt-3 section-title">App Mode</h1>
        <p className="mt-3 section-copy max-w-2xl">
          Switch between a bright white layout and a dark theme for the dashboard.
          Your choice is saved automatically.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setTheme('white')}
          className={`rounded-3xl border p-6 text-left transition-all duration-200 ${theme === 'white' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'}`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <FiSun /> White Theme
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Clean, bright, and close to the current app look.
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${theme === 'white' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
              {theme === 'white' ? 'Active' : 'Select'}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`rounded-3xl border p-6 text-left transition-all duration-200 ${theme === 'dark' ? 'border-slate-700 bg-slate-950 text-white shadow-lg shadow-slate-950/20' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'}`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className={`flex items-center gap-2 text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                <FiMoon /> Dark Theme
              </div>
              <p className={`mt-2 text-sm leading-6 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                A darker dashboard mode for low-light use.
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${theme === 'dark' ? 'bg-white text-slate-950' : 'bg-slate-100 text-slate-500'}`}>
              {theme === 'dark' ? 'Active' : 'Select'}
            </span>
          </div>
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">How it works</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          The selected mode is stored in your browser and applied across the dashboard shell when you return.
        </p>
      </div>
    </div>
  )
}

export default TouristSettingsPage