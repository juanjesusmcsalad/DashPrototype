const DEFAULT_NAV_ITEMS = [
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
  const stroke = active ? 'stroke-[#232b66]' : 'stroke-white/75'
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
    case 'users':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'key':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" strokeWidth="2">
          <circle cx="7.5" cy="15.5" r="4.5" />
          <path d="m21 2-9.6 9.6" />
          <path d="m15.5 7.5 3 3L22 7l-3-3" />
        </svg>
      )
    case 'user':
    default:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" strokeWidth="2">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
        </svg>
      )
  }
}

const MOBILE_SHORT_LABELS = {
  dashboard: 'Home',
  'academic-progress': 'Grades',
  tasks: 'Tasks',
  announcements: 'Announcements',
  overview: 'Overview',
  students: 'Students',
  schedule: 'Schedule',
  accounts: 'Accounts',
}

export default function Sidebar({
  activeTab,
  onSelectTab,
  onLogout,
  mobileOpen,
  onOpenMobile,
  onCloseMobile,
  navItems = DEFAULT_NAV_ITEMS,
  badgeText = '',
}) {
  const handleSelect = (id) => {
    onSelectTab(id)
    onCloseMobile?.()
  }

  const mobileQuickItems = navItems.some((i) => i.id === 'students')
    ? navItems.slice(0, 4)
    : [navItems[0], navItems[1], navItems[2], navItems[5]].filter(Boolean)

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
        className={`fixed inset-y-4 left-4 z-40 flex w-56 flex-col justify-between rounded-3xl bg-gradient-to-b from-[#4f5ec4] via-[#35408e] to-[#171e4f] p-5 text-white shadow-xl shadow-[#1b225c]/30 ring-1 ring-white/10 transition-transform duration-200 lg:static lg:inset-auto lg:h-full lg:shrink-0 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-[120%]'
        }`}
      >
        <div>
          {/* National University Logo */}
          <div className="mb-7 flex flex-col items-center justify-center pt-1">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#242c66]/80 p-2 shadow-inner ring-1 ring-[#ffd41c]/45">
              <img
                src="/models/nu-logo.png"
                alt="National University Logo"
                className="h-full w-full object-contain drop-shadow"
              />
            </div>
            {badgeText ? (
              <span className="mt-2.5 rounded-full bg-[#ffd41c] px-3 py-0.5 text-[10px] font-bold tracking-wider text-[#232b66] uppercase">
                {badgeText}
              </span>
            ) : (
              <span className="mt-2.5 text-[11px] font-bold tracking-wide text-white/90">
                Trackable Dash
              </span>
            )}
          </div>

          <nav data-tour="sidebar-nav" className="space-y-1.5" aria-label="Primary Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-all duration-200 ease-out ${
                    isActive
                      ? 'bg-gradient-to-r from-[#ffd41c] to-[#f5be00] font-bold text-[#232b66] shadow-md shadow-[#151b45]/25'
                      : 'font-medium text-white/80 hover:translate-x-1 hover:bg-gradient-to-r hover:from-white/18 hover:to-[#4f5ec4]/35 hover:text-white hover:shadow-sm'
                  }`}
                >
                  <span className="transition-transform duration-200 ease-out group-hover:scale-110">
                    <NavIcon name={item.icon} active={isActive} />
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="group mt-6 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-white/80 transition-all duration-200 ease-out hover:translate-x-1 hover:bg-gradient-to-r hover:from-white/15 hover:to-white/5 hover:text-white"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Logout</span>
        </button>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        data-tour="mobile-bottom-nav"
        aria-label="Mobile Navigation"
        className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-2xl bg-gradient-to-r from-[#424fa6] via-[#35408e] to-[#1b225c] px-2 py-1.5 text-white shadow-xl shadow-[#171d4b]/35 ring-1 ring-white/15 lg:hidden"
      >
        {mobileQuickItems.map((item) => {
          const isActive = activeTab === item.id
          const shortLabel = MOBILE_SHORT_LABELS[item.id] || item.label.split(' ')[0]
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[9.5px] tracking-tight transition sm:text-[10px] ${
                isActive
                  ? 'bg-[#ffd41c] font-bold text-[#232b66] shadow-sm'
                  : 'font-medium text-white/85 hover:bg-white/10'
              }`}
            >
              <NavIcon name={item.icon} active={isActive} />
              <span className="max-w-full truncate">{shortLabel}</span>
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => onOpenMobile?.()}
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-1.5 text-[10px] font-medium text-white/85 transition hover:bg-white/10"
        >
          <svg className="h-4 w-4 shrink-0 stroke-white/80" viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
          <span>More</span>
        </button>
      </nav>
    </>
  )
}
