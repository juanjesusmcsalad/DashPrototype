export default function WelcomeBanner({ firstName, displayDate }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#424fa6] via-[#35408e] to-[#242c66] px-6 py-6 text-white shadow-lg shadow-[#35408e]/20 sm:px-8 sm:py-7">
      {/* Soft ambient background shapes */}
      <div className="pointer-events-none absolute -top-12 right-24 h-40 w-40 rounded-full bg-[#ffd41c]/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 right-8 h-44 w-44 rounded-full bg-[#1a214f]/40 blur-2xl" />

      <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="max-w-md">
          <p className="text-xs font-semibold text-[#ffd41c]">{displayDate}</p>
          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {firstName}!
          </h1>
          <p className="mt-1.5 text-xs text-white/85 sm:text-sm">
            Always stay updated in your student progress in one place.
          </p>
        </div>

        {/* Custom vector student + graduation cap + backpack illustration */}
        <div className="hidden shrink-0 items-center sm:flex" aria-hidden="true">
          <svg className="h-32 w-60" viewBox="0 0 260 140" fill="none">
            {/* Floating geometric accents */}
            <circle cx="28" cy="64" r="5" fill="#F472B6" />
            <circle cx="144" cy="22" r="4" fill="#34D399" />
            <circle cx="242" cy="40" r="4" fill="#60A5FA" />
            <path d="M132 76c3-4 8-2 6 3s-8 3-5 7" stroke="#FB7185" strokeWidth="3" strokeLinecap="round" />

            {/* Graduation cap */}
            <g transform="rotate(-14 68 58)">
              <path d="M34 52l34-14 34 14-34 14-34-14z" fill="#312E81" />
              <path d="M46 58v13c0 5 10 9 22 9s22-4 22-9V58l-22 9-22-9z" fill="#1E1B4B" />
              <path d="M96 54v18" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
              <circle cx="96" cy="74" r="3.5" fill="#FBBF24" />
            </g>

            {/* Diploma scroll */}
            <g transform="rotate(-8 106 105)">
              <rect x="76" y="92" width="54" height="18" rx="9" fill="#FEF3C7" />
              <rect x="100" y="91" width="7" height="20" rx="2" fill="#F59E0B" />
            </g>

            {/* Student avatar */}
            <path d="M156 138c0-20 14-32 32-32s32 12 32 32H156z" fill="#4B3B36" />
            <path d="M178 106h20v14c0 6-4.5 10-10 10s-10-4-10-10v-14z" fill="#F4B69C" />
            <rect x="166" y="48" width="44" height="54" rx="22" fill="#F8C4AD" />
            {/* Cap / hat */}
            <path d="M164 56c0-14 10-24 24-24s24 10 24 24H164z" fill="#6B5B53" />
            <path d="M162 54h52c2 0 4 2 4 4s-2 4-4 4h-52c-2 0-4-2-4-4s2-4 4-4z" fill="#574740" />
            {/* Face details */}
            <circle cx="179" cy="74" r="3" fill="#292524" />
            <circle cx="197" cy="74" r="3" fill="#292524" />
            <path d="M180 86c3 5 13 5 16 0" stroke="#7F1D1D" strokeWidth="3" strokeLinecap="round" />

            {/* Backpack */}
            <g transform="rotate(14 232 95)">
              <rect x="214" y="68" width="34" height="44" rx="11" fill="#93C5FD" />
              <rect x="218" y="88" width="26" height="16" rx="6" fill="#FCD34D" />
              <path d="M224 68v-4a7 7 0 0 1 14 0v4" stroke="#60A5FA" strokeWidth="4" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  )
}
