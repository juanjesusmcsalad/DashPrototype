const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'academic-progress', label: 'Academic Progress', icon: 'book' },
  { id: 'tasks', label: 'Tasks', icon: 'pencil' },
  { id: 'performance-insights', label: 'Performance Insights', icon: 'insight' },
  { id: 'engagement-analytics', label: 'Engagement Analytics', icon: 'chart' },
  { id: 'announcements', label: 'Announcements', icon: 'megaphone' },
  { id: 'schedule', label: 'Schedule', icon: 'calendar' },
  { id: 'profile', label: 'Profile', icon: 'user' },
]

function NavIcon({ name, active }) {
  const stroke = active ? 'stroke-white' : 'stroke-white/75'
  const common = `h-4 w-4 shrink-0 ${stroke}`

  switch (name) {
    case 'grid':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      )
    case 'book':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    case 'pencil':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" strokeWidth="2">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      )
    case 'insight':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 9h10M7 13h6M7 17h4" />
        </svg>
      )
    case 'chart':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" strokeWidth="2">
          <path d="M3 3v18h18" />
          <path d="M7 15l4-4 3 3 5-6" />
        </svg>
      )
    case 'megaphone':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" strokeWidth="2">
          <path d="M3 11v2a2 2 0 0 0 2 2h2l5 4V5L7 9H5a2 2 0 0 0-2 2z" />
          <path d="M16 9.5a5 5 0 0 1 0 5" />
        </svg>
      )
    case 'calendar':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      )
    case 'user':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" strokeWidth="2">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
        </svg>
      )
    default:
      return null
  }
}

export default function Sidebar({ activeTab, onSelectTab, onLogout, mobileOpen, onCloseMobile }) {
  const handleSelect = (id) => {
    onSelectTab(id)
    onCloseMobile?.()
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[1px] lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-4 left-4 z-40 flex w-56 flex-col justify-between rounded-3xl bg-gradient-to-b from-[#a67bf5] via-[#905cf0] to-[#7c3aed] p-5 text-white shadow-xl shadow-purple-500/20 transition-transform duration-200 lg:static lg:inset-auto lg:h-full lg:shrink-0 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-[120%]'
        }`}
      >
        <div>
          {/* Top graduation emblem matching mockup */}
          <div className="mb-8 flex items-center justify-center pt-1">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6d28d9]/70 to-[#5b21b6]/80 shadow-inner ring-1 ring-white/15">
              <svg className="h-11 w-11 text-white" viewBox="0 0 64 64" fill="currentColor">
                <path d="M32 10L6 22l26 12 21-9.7V36h4V22L32 10z" />
                <path d="M16 30.5V40c0 4.4 7.2 8 16 8s16-3.6 16-8v-9.5L32 37.9 16 30.5z" opacity="0.9" />
                <rect x="18" y="49" width="28" height="6" rx="3" opacity="0.95" />
              </svg>
            </div>
          </div>

          <nav className="space-y-1.5" aria-label="Primary Navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-all ${
                    isActive
                      ? 'bg-white/20 font-semibold text-white shadow-sm ring-1 ring-white/20'
                      : 'font-medium text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <NavIcon name={item.icon} active={isActive} />
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="mt-6 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Logout</span>
        </button>
      </aside>
    </>
  )
}
