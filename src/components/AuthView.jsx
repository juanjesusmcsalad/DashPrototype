import { useState } from 'react'
import { isFirebaseConfigured } from '../firebase'
import { signInWithRole, signUpStudent } from '../services/authService'

const STRAND_OPTIONS = [
  'Grade 12 — HUMSS / Research Track',
  'Grade 12 — STEM / Research Track',
  'Grade 12 — ABM / Business Track',
  'Grade 12 — GAS Track',
  'Grade 12 — TVL / ICT Track',
]

export default function AuthView() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'admin'
  const [name, setName] = useState('')
  const [strand, setStrand] = useState(STRAND_OPTIONS[0])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setError('')
    setPassword('')
  }

  const fillDemoStudent = () => {
    setMode('signin')
    setEmail('carlos.conde@ctseniorhigh.edu.ph')
    setPassword('student123')
    setError('')
  }

  const fillDemoAdmin = () => {
    setMode('admin')
    setEmail('admin@ctseniorhigh.edu.ph')
    setPassword('admin123')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        await signUpStudent({ name, email, password, strand })
      } else if (mode === 'admin') {
        await signInWithRole({ email, password, expectedRole: 'admin' })
      } else {
        await signInWithRole({ email, password, expectedRole: 'student' })
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f6fb] p-4 sm:p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-[#35408e]/10 ring-1 ring-slate-100 lg:grid-cols-12">
        {/* Left Brand Showcase */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#424fa6] via-[#35408e] to-[#242c66] p-8 text-white lg:col-span-5">
          <div className="pointer-events-none absolute -top-16 -right-16 h-52 w-52 rounded-full bg-[#ffd41c]/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-[#1a214f]/50 blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#242c66]/80 ring-1 ring-[#ffd41c]/50">
                <img
                  src="/models/graduation-cap.png"
                  alt="CT Senior High"
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-bold tracking-wider text-[#ffd41c] uppercase">
                  CT Senior High
                </p>
                <p className="text-sm font-semibold text-white">Student Progress Portal</p>
              </div>
            </div>

            <h1 className="mt-8 text-2xl font-bold leading-snug sm:text-3xl">
              {mode === 'admin'
                ? 'Administrator Control Center'
                : 'Track your Senior High journey in one place.'}
            </h1>
            <p className="mt-2.5 text-xs leading-relaxed text-white/80 sm:text-sm">
              {mode === 'admin'
                ? 'Review student performance, update grades and attendance, and publish school-wide announcements.'
                : 'View grades, monitor attendance, complete research tasks, and explore personalized insights.'}
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
                src="/models/college-student.png"
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
            <div className="inline-flex rounded-full bg-[#f5f6fb] p-1 ring-1 ring-slate-200/80">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  mode === 'signin'
                    ? 'bg-[#35408e] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#35408e]'
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
                    : 'text-slate-600 hover:text-[#35408e]'
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
                    : 'text-slate-600 hover:text-[#35408e]'
                }`}
              >
                Admin Login
              </button>
            </div>

            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                isFirebaseConfigured
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                  : 'bg-[#ffd41c]/25 text-[#35408e] ring-1 ring-[#ffd41c]'
              }`}
            >
              {isFirebaseConfigured ? 'Firebase Auth' : 'Demo Auth Mode'}
            </span>
          </div>

          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              {mode === 'signup'
                ? 'Create Student Account'
                : mode === 'admin'
                  ? 'Administrator Sign In'
                  : 'Welcome Back, Student'}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {mode === 'signup'
                ? 'Sign up to create your personal student dashboard profile.'
                : mode === 'admin'
                  ? 'Authorized faculty and administrators only.'
                  : 'Sign in with your student email and password.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Carlos Conde"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#35408e] focus:ring-2 focus:ring-[#35408e]/15"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Grade & Strand
                  </label>
                  <select
                    value={strand}
                    onChange={(e) => setStrand(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#35408e] focus:ring-2 focus:ring-[#35408e]/15"
                  >
                    {STRAND_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  mode === 'admin'
                    ? 'admin@ctseniorhigh.edu.ph'
                    : 'student@ctseniorhigh.edu.ph'
                }
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#35408e] focus:ring-2 focus:ring-[#35408e]/15"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#35408e] focus:ring-2 focus:ring-[#35408e]/15"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-full py-2.5 text-sm font-bold shadow-sm transition disabled:opacity-60 ${
                mode === 'admin'
                  ? 'bg-[#ffd41c] text-[#232b66] hover:brightness-95'
                  : 'bg-[#35408e] text-white hover:bg-[#262f6d]'
              }`}
            >
              {loading
                ? 'Please wait...'
                : mode === 'signup'
                  ? 'Create Student Account'
                  : mode === 'admin'
                    ? 'Sign In as Administrator'
                    : 'Sign In to Dashboard'}
            </button>
          </form>

          {!isFirebaseConfigured && (
            <div className="mt-6 rounded-2xl border border-[#35408e]/15 bg-[#eef0fb]/60 p-4">
              <p className="text-xs font-bold text-[#35408e]">Quick Demo Credentials</p>
              <p className="mt-1 text-[11px] text-slate-600">
                Student: <code>carlos.conde@ctseniorhigh.edu.ph</code> / <code>student123</code>
                <br />
                Admin: <code>admin@ctseniorhigh.edu.ph</code> / <code>admin123</code>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={fillDemoStudent}
                  className="rounded-full bg-[#35408e] px-3.5 py-1 text-[11px] font-semibold text-white hover:bg-[#262f6d]"
                >
                  Fill Demo Student
                </button>
                <button
                  type="button"
                  onClick={fillDemoAdmin}
                  className="rounded-full bg-[#ffd41c] px-3.5 py-1 text-[11px] font-bold text-[#232b66] hover:brightness-95"
                >
                  Fill Demo Admin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
