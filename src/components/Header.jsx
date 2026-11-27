import { useState } from 'react'
import { getMergedRecommendations } from '../utils/academicHelpers'
import ThemeToggle from './ThemeToggle'

const STUDENT_PAGES = [
  { tab: 'dashboard', label: 'Dashboard', keywords: 'home overview summary' },
  { tab: 'academic-progress', label: 'Academic Progress', keywords: 'grades subjects report csv' },
  { tab: 'tasks', label: 'Tasks', keywords: 'assignments homework todo due date pending' },
  { tab: 'performance-insights', label: 'Performance Insights', keywords: 'recommendations notes strongest focus' },
  { tab: 'engagement-analytics', label: 'Engagement Analytics', keywords: 'attendance study hours weekly' },
  { tab: 'announcements', label: 'Announcements', keywords: 'notices updates news' },
  { tab: 'schedule', label: 'Class Schedule', keywords: 'timetable classes days time' },
  { tab: 'profile', label: 'Student Profile', keywords: 'account email section school' },
]

export default function Header({
  student,
  data,
  searchQuery,
  onSearchChange,
  onOpenMobileMenu,
  announcements,
  onNavigate,
  onOpenTutorial,
  darkMode,
  onToggleDarkMode,
}) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  const initials = student.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const q = searchQuery.trim().toLowerCase()
  const searchResults = []

  if (q) {
    for (const page of STUDENT_PAGES) {
      if (
        page.label.toLowerCase().includes(q) ||
        page.keywords.toLowerCase().includes(q)
      ) {
        searchResults.push({
          id: `page-${page.tab}`,
          type: 'Page',
          title: page.label,
          subtitle: 'Open section',
          tab: page.tab,
        })
      }
    }

    for (const task of data?.tasks || []) {
      if (
        task.title?.toLowerCase().includes(q) ||
        task.subject?.toLowerCase().includes(q) ||
        task.dueDate?.toLowerCase().includes(q)
      ) {
        const dueLabel =
          task.dueDate && task.dueDate !== 'No due date' ? ` • Due ${task.dueDate}` : ''
        searchResults.push({
          id: `task-${task.id}`,
          type: 'Task',
          title: task.title,
          subtitle: `${task.subject} • ${task.completed ? 'Done' : 'Pending'}${dueLabel}`,
          tab: 'tasks',
        })
      }
    }

    for (const ann of data?.announcements || announcements || []) {
      if (
        ann.title?.toLowerCase().includes(q) ||
        ann.body?.toLowerCase().includes(q) ||
        ann.tag?.toLowerCase().includes(q)
      ) {
        searchResults.push({
          id: `ann-${ann.id}`,
          type: 'Announcement',
          title: ann.title,
          subtitle: `${ann.tag} • ${ann.date}`,
          tab: 'announcements',
        })
      }
    }

    for (const subj of data?.subjects || []) {
      if (
        subj.name?.toLowerCase().includes(q) ||
        subj.shortName?.toLowerCase().includes(q) ||
        subj.teacher?.toLowerCase().includes(q)
      ) {
        searchResults.push({
          id: `subj-${subj.id}`,
          type: 'Subject',
          title: subj.name,
          subtitle: `${subj.teacher} • ${subj.grade}%`,
          tab: 'academic-progress',
        })
      }
    }

    for (const slot of data?.schedule || []) {
      if (
        slot.subject?.toLowerCase().includes(q) ||
        slot.day?.toLowerCase().includes(q) ||
        slot.time?.toLowerCase().includes(q)
      ) {
        searchResults.push({
          id: `sched-${slot.id}`,
          type: 'Schedule',
          title: slot.subject,
          subtitle: `${slot.day} • ${slot.time}`,
          tab: 'schedule',
        })
      }
    }

    for (const rec of getMergedRecommendations(data)) {
      if (
        rec.text?.toLowerCase().includes(q) ||
        rec.category?.toLowerCase().includes(q)
      ) {
        searchResults.push({
          id: `rec-${rec.id}`,
          type: 'Note',
          title: rec.text,
          subtitle: rec.category || 'Recommendation',
          tab: 'performance-insights',
        })
      }
    }
  }

  const visibleResults = searchResults.slice(0, 8)

  const handleSelectResult = (item) => {
    setSearchFocused(false)
    onNavigate(item.tab)
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
      <button
        type="button"
        onClick={onOpenMobileMenu}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200/80 lg:hidden dark:bg-[#181e38] dark:text-slate-200 dark:ring-slate-700"
        aria-label="Open navigation menu"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Centered Global Search */}
      <div className="order-last flex w-full justify-center sm:order-none sm:flex-1">
        <div data-tour="global-search" className="relative w-full max-w-md">
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
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            onChange={(e) => {
              onSearchChange(e.target.value)
              setSearchFocused(true)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && visibleResults.length > 0) {
                e.preventDefault()
                handleSelectResult(visibleResults[0])
              }
            }}
            placeholder="Search tasks, announcements, grades, schedule..."
            aria-label="Search tasks, announcements, subjects, or pages"
            className="w-full rounded-full bg-white py-2.5 pr-4 pl-10 text-base text-slate-700 placeholder-slate-400 shadow-[0_6px_20px_rgba(53,64,142,0.08)] ring-1 ring-slate-100 transition outline-none focus:ring-2 focus:ring-[#35408e] sm:text-sm dark:bg-[#181e38] dark:text-slate-100 dark:placeholder-slate-400 dark:ring-slate-700 dark:focus:ring-[#ffd41c]"
          />

          {searchFocused && q && (
            <div className="absolute top-full right-0 left-0 z-40 mt-2 max-h-80 overflow-y-auto rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-200/80 dark:bg-[#181e38] dark:ring-slate-700">
              {visibleResults.length === 0 ? (
                <p className="px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400">
                  No matches for &ldquo;{searchQuery}&rdquo;.
                </p>
              ) : (
                <div className="space-y-1">
                  {visibleResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onMouseDown={() => handleSelectResult(item)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-[#eef0fb] dark:hover:bg-[#232b52]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </p>
                        <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {item.subtitle}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#ffd41c]/35 px-2 py-0.5 text-[10px] font-bold text-[#35408e] dark:text-[#ffd41c]">
                        {item.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Student Profile + Tutorial + Theme + Notification Bell */}
      <div className="relative flex items-center gap-2.5 sm:gap-3.5">
        <button
          type="button"
          data-tour="help-trigger"
          onClick={onOpenTutorial}
          aria-label="Open quickstart tutorial"
          title="Quickstart Guide"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[#35408e] shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:bg-[#eef0fb] dark:bg-[#1e2647] dark:text-[#ffd41c] dark:ring-slate-700 dark:hover:bg-[#27315a]"
        >
          ?
        </button>

        <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />

        <button
          type="button"
          onClick={() => onNavigate('profile')}
          aria-label="Open student profile"
          className="flex items-center gap-2.5 rounded-full p-1 text-left transition hover:bg-white/70 sm:pr-2 dark:hover:bg-white/10"
        >
          <img
            src="/models/nu-logo.png"
            alt={initials}
            className="h-9 w-9 rounded-full bg-[#242c66] object-contain p-1 shadow-sm ring-2 ring-[#ffd41c] sm:h-10 sm:w-10"
          />
          <div className="hidden leading-tight sm:block">
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
          <div className="absolute top-12 right-0 z-30 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-100 dark:bg-[#181e38] dark:ring-slate-700">
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
