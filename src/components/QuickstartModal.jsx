import { useEffect, useState } from 'react'

const STUDENT_STEPS = [
  {
    selector: '[data-tour="student-overview"]',
    placement: 'bottom',
    badge: 'Step 1 of 5 • Overview',
    title: 'Academic Overview',
    description:
      'Your Grade Average, Attendance Rate, and Tasks Completed live right here. Click any card to inspect details.',
  },
  {
    selector: '[data-tour="student-charts"]',
    placement: 'top',
    badge: 'Step 2 of 5 • Grades',
    title: 'Grades by Subject',
    description:
      'Your 5 subject bars update automatically whenever an administrator saves your official grades.',
  },
  {
    selector: '[data-tour="sidebar-nav"], [data-tour="mobile-bottom-nav"]',
    placement: 'right',
    badge: 'Step 3 of 5 • Menu',
    title: 'Navigation Menu',
    description:
      'Switch between Academic Progress, Tasks (with custom due dates), Performance Insights, Engagement Analytics, Announcements, and Class Schedule.',
  },
  {
    selector: '[data-tour="global-search"]',
    placement: 'bottom',
    badge: 'Step 4 of 5 • Search',
    title: 'Quick Search',
    description:
      'Search any task, announcement, subject, schedule, or page here — click a result or press Enter to jump straight to it.',
  },
  {
    selector: '[data-tour="help-trigger"]',
    placement: 'bottom',
    badge: 'Step 5 of 5 • Replay Anytime',
    title: 'Need This Guide Again?',
    description:
      'This spotlight tour will not open automatically again for your account. Click the ? button anytime to replay it.',
  },
]

const ADMIN_STEPS = [
  {
    selector: '[data-tour="admin-kpis"]',
    placement: 'bottom',
    badge: 'Step 1 of 5 • Overview',
    title: 'Portal Summary',
    description:
      'See live student counts, overall averages, attendance, and total accounts across your NU MOA CT sections.',
  },
  {
    selector: '[data-tour="admin-sections"]',
    placement: 'left',
    badge: 'Step 2 of 5 • Sections',
    title: 'Sections Directory',
    description:
      'Click 12SHS2510 or 12SHS2509 here anytime to jump straight to that section in Manage Students.',
  },
  {
    selector: '[data-tour="sidebar-nav"], [data-tour="mobile-bottom-nav"]',
    placement: 'right',
    badge: 'Step 3 of 5 • Admin Tools',
    title: 'Admin Controls',
    description:
      'Edit grades and post class notes in Manage Students, build timetables in Class Schedule, reset/delete accounts in User Credentials, and post notices in Announcements.',
  },
  {
    selector: '[data-tour="global-search"]',
    placement: 'bottom',
    badge: 'Step 4 of 5 • Search',
    title: 'Quick-Jump Search',
    description:
      'Type any student name, task, announcement, note, or page to jump straight there.',
  },
  {
    selector: '[data-tour="help-trigger"]',
    placement: 'bottom',
    badge: 'Step 5 of 5 • Replay Anytime',
    title: 'Need This Guide Again?',
    description:
      'This spotlight tour will not open automatically again for your account. Click the ? button anytime to replay it.',
  },
]

export default function QuickstartModal({ isOpen, role = 'student', onClose }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState(null)

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

    const findVisibleTarget = () => {
      if (!current.selector) return null
      const vwNow = window.innerWidth
      const candidates = document.querySelectorAll(current.selector)
      for (const node of candidates) {
        const rect = node.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.left < vwNow) {
          return node
        }
      }
      return null
    }

    const measure = () => {
      const el = findVisibleTarget()
      if (!el) {
        setTargetRect(null)
        return
      }
      const r = el.getBoundingClientRect()
      setTargetRect({
        top: r.top,
        left: r.left,
        right: r.right,
        bottom: r.bottom,
        width: r.width,
        height: r.height,
      })
    }

    const el = findVisibleTarget()
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    }

    const rafId = requestAnimationFrame(measure)
    const timerId = setTimeout(measure, 300)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(timerId)
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [isOpen, stepIndex, current.selector, onClose])

  if (!isOpen) return null

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const isMobile = vw < 640
  const pad = isMobile ? 6 : 8

  const cut = targetRect
    ? {
        top: Math.max(4, targetRect.top - pad),
        left: Math.max(4, targetRect.left - pad),
        right: Math.min(vw - 4, targetRect.right + pad),
        bottom: Math.min(vh - 4, targetRect.bottom + pad),
      }
    : null

  const cutW = cut ? Math.max(0, cut.right - cut.left) : 0
  const cutH = cut ? Math.max(0, cut.bottom - cut.top) : 0

  const edgePad = isMobile ? 12 : 16
  const cardWidth = Math.min(352, vw - edgePad * 2)
  const neededHeight = isMobile ? 200 : 235
  let cardStyle = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  }
  let arrowSide = null
  let arrowOffset = '50%'

  if (cut && cutW > 0 && cutH > 0) {
    if (!isMobile && current.placement === 'right' && vw - cut.right >= cardWidth + 28) {
      const top = Math.min(Math.max(16, cut.top), Math.max(16, vh - 260))
      cardStyle = { top, left: cut.right + 16 }
      arrowSide = 'left'
      arrowOffset = `${Math.min(180, Math.max(24, cut.top + Math.min(cutH, 120) / 2 - top))}px`
    } else if (!isMobile && current.placement === 'left' && cut.left >= cardWidth + 28) {
      const top = Math.min(Math.max(16, cut.top), Math.max(16, vh - 260))
      cardStyle = { top, left: cut.left - cardWidth - 16 }
      arrowSide = 'right'
      arrowOffset = `${Math.min(180, Math.max(24, cut.top + Math.min(cutH, 120) / 2 - top))}px`
    } else {
      const spaceBelow = vh - cut.bottom
      const spaceAbove = cut.top
      const centerX = cut.left + cutW / 2
      const left = Math.min(
        Math.max(edgePad, centerX - cardWidth / 2),
        vw - cardWidth - edgePad
      )
      arrowOffset = `${Math.min(cardWidth - 24, Math.max(24, centerX - left))}px`

      const preferTop = current.placement === 'top'
      if (preferTop && spaceAbove >= neededHeight) {
        cardStyle = { bottom: Math.max(edgePad, vh - cut.top + 12), left }
        arrowSide = 'bottom'
      } else if (!preferTop && spaceBelow >= neededHeight) {
        cardStyle = { top: Math.max(edgePad, cut.bottom + 12), left }
        arrowSide = 'top'
      } else if (spaceAbove >= neededHeight && spaceAbove >= spaceBelow) {
        cardStyle = { bottom: Math.max(edgePad, vh - cut.top + 12), left }
        arrowSide = 'bottom'
      } else if (spaceBelow >= neededHeight) {
        cardStyle = { top: Math.max(edgePad, cut.bottom + 12), left }
        arrowSide = 'top'
      } else if (spaceAbove >= spaceBelow) {
        cardStyle = { top: edgePad, left }
      } else {
        cardStyle = { bottom: edgePad, left }
      }
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="quickstart-title">
      {cut ? (
        <>
          <div
            onClick={onClose}
            className="fixed top-0 right-0 left-0 z-40 bg-slate-950/55 backdrop-blur-[3px] transition-all duration-300 ease-out"
            style={{ height: cut.top }}
          />
          <div
            onClick={onClose}
            className="fixed right-0 bottom-0 left-0 z-40 bg-slate-950/55 backdrop-blur-[3px] transition-all duration-300 ease-out"
            style={{ top: cut.bottom }}
          />
          <div
            onClick={onClose}
            className="fixed left-0 z-40 bg-slate-950/55 backdrop-blur-[3px] transition-all duration-300 ease-out"
            style={{ top: cut.top, width: cut.left, height: cutH }}
          />
          <div
            onClick={onClose}
            className="fixed right-0 z-40 bg-slate-950/55 backdrop-blur-[3px] transition-all duration-300 ease-out"
            style={{ top: cut.top, left: cut.right, height: cutH }}
          />
          <div
            className="pointer-events-none fixed z-40 rounded-2xl border-2 border-[#ffd41c] shadow-[0_0_0_4px_rgba(255,212,28,0.28)] transition-all duration-300 ease-out"
            style={{ top: cut.top, left: cut.left, width: cutW, height: cutH }}
          />
        </>
      ) : (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-[3px]"
        />
      )}

      <div
        className="fixed z-50 rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80 transition-all duration-300 ease-out dark:bg-[#181e38] dark:ring-slate-700"
        style={{ width: cardWidth, ...cardStyle }}
        onClick={(e) => e.stopPropagation()}
      >
        {arrowSide === 'top' && (
          <div
            className="absolute -top-2 h-4 w-4 -translate-x-1/2 rotate-45 bg-[#4655b8]"
            style={{ left: arrowOffset }}
          />
        )}
        {arrowSide === 'bottom' && (
          <div
            className="absolute -bottom-2 h-4 w-4 -translate-x-1/2 rotate-45 border-r border-b border-slate-200/80 bg-white dark:border-slate-700 dark:bg-[#181e38]"
            style={{ left: arrowOffset }}
          />
        )}
        {arrowSide === 'left' && (
          <div
            className="absolute -left-2 h-4 w-4 -translate-y-1/2 rotate-45 bg-[#3e4ca9]"
            style={{ top: arrowOffset }}
          />
        )}
        {arrowSide === 'right' && (
          <div
            className="absolute -right-2 h-4 w-4 -translate-y-1/2 rotate-45 bg-[#35408e]"
            style={{ top: arrowOffset }}
          />
        )}

        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#4f5ec4] via-[#35408e] to-[#171d4b] px-4 py-3 text-white sm:px-5 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-[#ffd41c] px-2.5 py-0.5 text-[10px] font-bold text-[#232b66]">
              {current.badge}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close quickstart"
              className="rounded-full px-1.5 py-0.5 text-sm font-bold text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              ×
            </button>
          </div>
          <h2 id="quickstart-title" className="mt-2 text-sm font-bold tracking-tight sm:mt-2.5 sm:text-base">
            {current.title}
          </h2>
        </div>

        <div className="space-y-3 p-4 sm:space-y-4 sm:p-5">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {current.description}
          </p>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-700/70">
            <div className="flex items-center gap-1.5" aria-label="Tutorial progress">
              {steps.map((s, idx) => (
                <button
                  key={s.badge}
                  type="button"
                  onClick={() => setStepIndex(idx)}
                  aria-label={`Go to step ${idx + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    idx === stepIndex
                      ? 'w-5 bg-[#35408e] dark:bg-[#ffd41c]'
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
                  className="rounded-full px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10"
                >
                  Skip
                </button>
              )}
              {!isFirst && (
                <button
                  type="button"
                  onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                  className="rounded-full border border-slate-200 px-3.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-[#35408e] dark:border-slate-700 dark:text-slate-200"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={() => (isLast ? onClose() : setStepIndex((i) => Math.min(steps.length - 1, i + 1)))}
                className="rounded-full bg-gradient-to-r from-[#424fa6] to-[#20275e] px-4 py-1 text-xs font-bold text-white shadow-sm transition hover:brightness-110 dark:from-[#ffd41c] dark:to-[#f2b800] dark:text-[#232b66]"
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
