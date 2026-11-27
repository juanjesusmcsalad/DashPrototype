import { useEffect, useState } from 'react'

const STUDENT_STEPS = [
  {
    badge: 'Step 1 of 4 • Overview',
    title: 'Welcome to Trackable Dash',
    description:
      'Your personal NU MOA Senior High dashboard brings your grades, attendance, and tasks into one clear view.',
    highlights: [
      'Check your Grade Average, Attendance Rate, and Tasks Completed cards at the top.',
      'Your Grades by Subject chart and progress bars update automatically whenever teachers save grades.',
    ],
  },
  {
    badge: 'Step 2 of 4 • Progress & Tasks',
    title: 'Manage Tasks & Study Hours',
    description:
      'Stay on top of deadlines and track your weekly effort without guesswork.',
    highlights: [
      'Open Tasks to create personal reminders with your own due date and check off completed work.',
      'Open Engagement Analytics to log daily study hours against your weekly target.',
      'Export or print your official report anytime inside Academic Progress.',
    ],
  },
  {
    badge: 'Step 3 of 4 • Insights & Class Info',
    title: 'Recommendations, Schedule & Notices',
    description:
      'Get clear guidance on where to focus and never miss class updates.',
    highlights: [
      'Performance Insights highlights your strongest subject, focus area, and personalized study notes.',
      'Class Schedule shows your section timetable, and Announcements shows updates for your section.',
    ],
  },
  {
    badge: 'Step 4 of 4 • Navigation & Help',
    title: 'Quick-Jump Search & Replay Help',
    description:
      'Move anywhere in seconds using the centered search bar at the top.',
    highlights: [
      'Type any task, announcement, subject, or page name in Search and click a result (or press Enter) to jump straight there.',
      'This quickstart only appears automatically once — click the ? button in the header anytime to open it again.',
    ],
  },
]

const ADMIN_STEPS = [
  {
    badge: 'Step 1 of 4 • Admin Control',
    title: 'Welcome to the Admin Portal',
    description:
      'Manage CT Senior High sections 12SHS2510 and 12SHS2509 cleanly from one shared workspace.',
    highlights: [
      'Admin Overview gives you live student counts, overall averages, and quick links to each section.',
      'All changes sync live across every administrator device via Firebase Firestore.',
    ],
  },
  {
    badge: 'Step 2 of 4 • Students, Tasks & Notes',
    title: 'Edit Records & Broadcast Notes',
    description:
      'Update individual student metrics or push tasks and notes to a whole class at once.',
    highlights: [
      'In Manage Students, use Assign Bulk Task (with custom due dates) or Post Note for All Sections or one specific section.',
      'Select any student to edit their attendance, subject grades, weekly study hours, or personal adviser notes.',
    ],
  },
  {
    badge: 'Step 3 of 4 • Timetables & Notices',
    title: 'Schedules & Announcements',
    description:
      'Configure class timetables and publish announcements that stay in sync even for future sign-ups.',
    highlights: [
      'Newly registered students automatically inherit existing All Sections and matching-section announcements, notes, and schedules.',
      'Items directed to one section stay hidden from the other section.',
    ],
  },
  {
    badge: 'Step 4 of 4 • Accounts & Search',
    title: 'User Credentials, Search & Help',
    description:
      'Manage accounts safely and jump straight to any student or setting.',
    highlights: [
      'In User Credentials, send free password-reset emails or delete removed student accounts.',
      'Use the centered search bar to jump to any student, task, or page — and click the ? button anytime to reopen this guide.',
    ],
  },
]

export default function QuickstartModal({ isOpen, role = 'student', userName, onClose }) {
  const [stepIndex, setStepIndex] = useState(0)
  const steps = role === 'admin' ? ADMIN_STEPS : STUDENT_STEPS
  const current = steps[stepIndex] || steps[0]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === steps.length - 1

  useEffect(() => {
    if (!isOpen) return undefined
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quickstart-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200/80 dark:bg-[#181e38] dark:ring-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-[#4f5ec4] via-[#35408e] to-[#171d4b] px-6 py-5 text-white">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-[#ffd41c] px-3 py-0.5 text-[11px] font-bold text-[#232b66]">
              {current.badge}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close quickstart"
              className="rounded-full px-2 py-0.5 text-base font-bold text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              ×
            </button>
          </div>
          <h2 id="quickstart-title" className="mt-3 text-xl font-bold tracking-tight">
            {isFirst && userName ? `${current.title}, ${userName.split(/\s+/)[0]}!` : current.title}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-white/85">{current.description}</p>
        </div>

        <div className="space-y-4 p-6">
          <ul className="space-y-2.5">
            {current.highlights.map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2.5 rounded-xl bg-[#f5f6fb] px-3.5 py-2.5 text-xs leading-relaxed font-medium text-slate-700 dark:bg-[#11162b] dark:text-slate-200"
              >
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#ffd41c] ring-2 ring-[#35408e]/30" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-700/70">
            <div className="flex items-center gap-1.5" aria-label="Tutorial progress">
              {steps.map((s, idx) => (
                <button
                  key={s.badge}
                  type="button"
                  onClick={() => setStepIndex(idx)}
                  aria-label={`Go to step ${idx + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    idx === stepIndex
                      ? 'w-6 bg-[#35408e] dark:bg-[#ffd41c]'
                      : 'w-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {!isLast && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10"
                >
                  Skip
                </button>
              )}
              {!isFirst && (
                <button
                  type="button"
                  onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                  className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#35408e] dark:border-slate-700 dark:text-slate-200"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={() => (isLast ? onClose() : setStepIndex((i) => Math.min(steps.length - 1, i + 1)))}
                className="rounded-full bg-gradient-to-r from-[#424fa6] to-[#20275e] px-5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110 dark:from-[#ffd41c] dark:to-[#f2b800] dark:text-[#232b66]"
              >
                {isLast ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
