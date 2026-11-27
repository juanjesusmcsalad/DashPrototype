import { useState } from 'react'

export default function SpoilerText({ value, className = '' }) {
  const [revealed, setRevealed] = useState(false)
  const displayValue = value || '—'

  return (
    <button
      type="button"
      onClick={() => setRevealed((prev) => !prev)}
      aria-pressed={revealed}
      aria-label={revealed ? 'Hide sensitive text' : 'Reveal hidden text'}
      title={revealed ? 'Click to hide' : 'Click to reveal'}
      className={`mt-1 inline-flex max-w-full cursor-pointer items-center rounded-lg px-2.5 py-1 text-left transition-all duration-200 select-none ${
        revealed
          ? 'bg-slate-100/90 select-text hover:bg-slate-200/70 dark:bg-white/10 dark:hover:bg-white/15'
          : 'bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600'
      } ${className}`}
    >
      <span
        className={`truncate transition-opacity duration-200 ${
          revealed ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {displayValue}
      </span>
    </button>
  )
}
