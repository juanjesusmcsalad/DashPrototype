import { useState } from 'react'
import { isFirebaseConfigured } from '../firebase'
import { ALLOWED_SECTIONS, signInWithRole, signUpStudent } from '../services/authService'
import ThemeToggle from './ThemeToggle'

export default function AuthView({ darkMode, onToggleDarkMode }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'admin'
  const [name, setName] = useState('')
  const [section, setSection] = useState(ALLOWED_SECTIONS[0])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [staySignedIn, setStaySignedIn] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setError('')
    setPassword('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        await signUpStudent({ name, email, password, section, staySignedIn })
      } else if (mode === 'admin') {
        await signInWithRole({ email, password, expectedRole: 'admin', staySignedIn })
      } else {
        await signInWithRole({ email, password, section, expectedRole: 'student', staySignedIn })
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f6fb] p-4 transition-colors sm:p-6 dark:bg-[#0f1326]">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-[#35408e]/10 ring-1 ring-slate-100 lg:grid-cols-12 dark:bg-[#181e38] dark:ring-slate-700/70">
        {/* Left Brand Showcase */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#424fa6] via-[#35408e] to-[#242c66] p-8 text-white lg:col-span-5">
          <div className="pointer-events-none absolute -top-16 -right-16 h-52 w-52 rounded-full bg-[#ffd41c]/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-[#1a214f]/50 blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#242c66]/80 ring-1 ring-[#ffd41c]/50">
                <svg className="h-7 w-7" viewBox="0 0 64 64" fill="none">
                  <path d="M32 10L6 22l26 12 21-9.7V36h4V22L32 10z" fill="#FFD41C" />
                  <path
                    d="M16 30.5V40c0 4.4 7.2 8 16 8s16-3.6 16-8v-9.5L32 37.9 16 30.5z"
                    fill="#FFFFFF"
                    opacity="0.95"
                  />
                  <rect x="18" y="49" width="28" height="6" rx="3" fill="#FFD41C" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold tracking-wider text-[#ffd41c] uppercase">
                  NU MOA • CT Senior High
                </p>
                <p className="text-sm font-semibold text-white">Trackable Dash</p>
              </div>
            </div>

            <h1 className="mt-8 text-2xl font-bold leading-snug sm:text-3xl">
              {mode === 'admin'
                ? 'Administrator Control Center'
                : 'Track your Senior High journey in one place.'}
            </h1>
            <p className="mt-2.5 text-xs leading-relaxed text-white/80 sm:text-sm">
              {mode === 'admin'
                ? 'Manage sections 12SHS2510 & 12SHS2509, inspect user credentials, edit grades, and publish announcements.'
                : 'Access sections 12SHS2510 and 12SHS2509 to monitor grades, attendance, tasks, and insights.'}
            </p>
          </div>

          {/* Updated 3D Models Showcase */}
          <div className="relative z-10 mt-8 flex items-end justify-center pt-4">
            <div className="relative h-44 w-64" aria-hidden="true">
              <img
                src="/models/scholarcap.png"
                alt=""
                className="absolute bottom-0 left-0 h-32 w-32 object-contain drop-shadow-md"
              />
              <img
                src="/models/bulldawg.png"
                alt=""
                className="absolute bottom-0 left-1/2 h-44 w-44 -translate-x-1/2 object-contain drop-shadow-xl"
              />
              <img
                src="/models/backpack.png"
                alt=""
                className="absolute right-0 bottom-0 h-28 w-28 object-contain drop-shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Right Auth Form */}
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-full bg-[#f5f6fb] p-1 ring-1 ring-slate-200/80 dark:bg-[#11162b] dark:ring-slate-700">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  mode === 'signin'
                    ? 'bg-[#35408e] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#35408e] dark:text-slate-300 dark:hover:text-[#ffd41c]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  mode === 'signup'
                    ? 'bg-[#35408e] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#35408e] dark:text-slate-300 dark:hover:text-[#ffd41c]'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => switchMode('admin')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  mode === 'admin'
                    ? 'bg-[#ffd41c] text-[#232b66] shadow-sm'
                    : 'text-slate-600 hover:text-[#35408e] dark:text-slate-300 dark:hover:text-[#ffd41c]'
                }`}
              >
                Admin Login
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  isFirebaseConfigured
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-700'
                    : 'bg-[#ffd41c]/25 text-[#35408e] ring-1 ring-[#ffd41c] dark:bg-[#ffd41c]/15 dark:text-[#ffd41c]'
                }`}
              >
                {isFirebaseConfigured ? 'Firebase Auth' : 'Demo Auth Mode'}
              </span>
              <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
            </div>
          </div>

          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {mode === 'signup'
                ? 'Create Student Account'
                : mode === 'admin'
                  ? 'Administrator Sign In'
                  : 'Welcome Back, Student'}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {mode === 'signup'
                ? 'Select your section (12SHS2510 or 12SHS2509) to create your dashboard account.'
                : mode === 'admin'
                  ? 'Authorized faculty and administrators only.'
                  : 'Select your section and sign in with your email and password.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mateo Armendáriz De la Fuente"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#35408e] focus:ring-2 focus:ring-[#35408e]/15 dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
                />
              </div>
            )}

            {mode !== 'admin' && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Section
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {ALLOWED_SECTIONS.map((sec) => {
                    const selected = section === sec
                    return (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setSection(sec)}
                        className={`rounded-xl border px-3.5 py-2.5 text-sm font-bold transition ${
                          selected
                            ? 'border-[#35408e] bg-[#eef0fb] text-[#35408e] ring-2 ring-[#35408e]/15 dark:border-[#ffd41c] dark:bg-[#232b52] dark:text-[#ffd41c]'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-[#35408e]/40 dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-300'
                        }`}
                      >
                        {sec}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  mode === 'admin'
                    ? 'admin@gmail.com'
                    : 'student@gmail.com'
                }
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#35408e] focus:ring-2 focus:ring-[#35408e]/15 dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#35408e] focus:ring-2 focus:ring-[#35408e]/15 dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
              />
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 text-xs dark:border-slate-700/80 dark:bg-[#11162b]/70">
              <span className="flex items-center gap-2.5 font-semibold text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={staySignedIn}
                  onChange={(e) => setStaySignedIn(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#35408e] accent-[#35408e] focus:ring-[#35408e]/25 dark:border-slate-600 dark:accent-[#ffd41c]"
                />
                Stay signed in
              </span>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {staySignedIn ? 'Remember on this device' : 'This session only'}
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-full py-2.5 text-sm font-bold shadow-sm transition disabled:opacity-60 ${
                mode === 'admin'
                  ? 'bg-[#ffd41c] text-[#232b66] hover:brightness-95'
                  : 'bg-[#35408e] text-white hover:bg-[#262f6d] dark:bg-[#4c59b5]'
              }`}
            >
              {loading
                ? 'Please wait...'
                : mode === 'signup'
                  ? 'Create Student Account'
                  : mode === 'admin'
                    ? 'Sign In as Administrator'
                    : `Sign In (${section})`}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
