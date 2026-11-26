import { useState } from 'react'
import ThemeToggle from './ThemeToggle'

export default function Header({
  student,
  searchQuery,
  onSearchChange,
  onOpenMobileMenu,
  announcements,
  syncStatus,
  onNavigate,
  darkMode,
  onToggleDarkMode,
}) {
  const [showNotifications, setShowNotifications] = useState(false)

  const initials = student.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200/80 lg:hidden dark:bg-[#181e38] dark:text-slate-200 dark:ring-slate-700"
          aria-label="Open navigation menu"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Search Pill matching mockup */}
        <div className="relative w-64 sm:w-80">
          <svg
            className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            aria-label="Search subjects, tasks, or recommendations"
            className="w-full rounded-full bg-white py-2.5 pr-4 pl-10 text-sm text-slate-700 placeholder-slate-400 shadow-[0_6px_20px_rgba(53,64,142,0.08)] ring-1 ring-slate-100 transition outline-none focus:ring-2 focus:ring-[#35408e] dark:bg-[#181e38] dark:text-slate-100 dark:placeholder-slate-400 dark:ring-slate-700 dark:focus:ring-[#ffd41c]"
          />
        </div>
      </div>

      {/* Student Profile + Sync Badge + Notification Bell */}
      <div className="relative flex items-center gap-3 sm:gap-4">
        <span
          title={
            syncStatus.mode === 'firestore'
              ? 'Connected to Firebase Firestore'
              : 'Running in local demo mode (configure .env for live Firestore)'
          }
          className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline-flex ${
            syncStatus.mode === 'firestore'
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-700'
              : 'bg-[#ffd41c]/20 text-[#35408e] ring-1 ring-[#ffd41c] dark:bg-[#ffd41c]/15 dark:text-[#ffd41c]'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              syncStatus.mode === 'firestore' ? 'bg-emerald-500' : 'bg-[#35408e] dark:bg-[#ffd41c]'
            }`}
          />
          {syncStatus.mode === 'firestore' ? 'Firestore Live' : 'Demo Mode'}
        </span>

        <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />

        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className="flex items-center gap-2.5 rounded-full py-1 pr-2 pl-1 text-left transition hover:bg-white/70 dark:hover:bg-white/10"
        >
          <img
            src="/models/nu-logo.png"
            alt={initials}
            className="h-10 w-10 rounded-full bg-[#242c66] object-contain p-1 shadow-sm ring-2 ring-[#ffd41c]"
          />
          <div className="leading-tight">
            <p className="text-xs font-bold text-slate-900 sm:text-sm dark:text-slate-100">{student.name}</p>
            <p className="text-[10px] font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
              {student.section ? `${student.section} • ${student.school}` : student.school}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setShowNotifications((prev) => !prev)}
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#35408e] shadow-sm ring-1 ring-slate-100 transition hover:bg-[#eef0fb] dark:bg-[#1e2647] dark:text-[#ffd41c] dark:ring-slate-700 dark:hover:bg-[#27315a]"
          aria-label="Toggle notifications"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm6-6v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z" />
          </svg>
          {announcements.length > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#ffd41c] ring-2 ring-white dark:ring-[#1e2647]" />
          )}
        </button>

        {showNotifications && (
          <div className="absolute top-12 right-0 z-30 w-72 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-100 dark:bg-[#181e38] dark:ring-slate-700">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Recent Announcements</p>
              <button
                type="button"
                onClick={() => {
                  setShowNotifications(false)
                  onNavigate('announcements')
                }}
                className="text-xs font-semibold text-[#35408e] hover:text-[#242c66] dark:text-[#ffd41c]"
              >
                See all
              </button>
            </div>
            <div className="space-y-2.5">
              {announcements.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-500 dark:bg-[#11162b] dark:text-slate-400">
                  No announcements yet.
                </p>
              ) : (
                announcements.slice(0, 3).map((item) => (
                  <div key={item.id} className="rounded-xl bg-slate-50 p-2.5 dark:bg-[#11162b]">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{item.title}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{item.date}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
