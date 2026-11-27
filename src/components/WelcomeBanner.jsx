export default function WelcomeBanner({ firstName, displayDate }) {
  return (
    <section className="relative shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br from-[#4f5ec4] via-[#35408e] to-[#171d4b] px-5 py-3.5 text-white shadow-lg shadow-[#1b225c]/25 ring-1 ring-white/10 sm:px-7 sm:py-4">
      {/* Soft ambient background shapes */}
      <div className="pointer-events-none absolute -top-12 right-24 h-36 w-36 rounded-full bg-[#ffd41c]/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 right-8 h-36 w-36 rounded-full bg-[#1a214f]/40 blur-2xl" />

      <div className="relative z-10 flex items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 max-w-md">
          <p className="text-[11px] font-semibold text-[#ffd41c] sm:text-xs">{displayDate}</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight sm:mt-1.5 sm:text-2xl">
            Welcome back, {firstName}!
          </h1>
          <p className="mt-0.5 text-xs text-white/85 sm:text-sm">
            Always stay updated in your student progress in one place.
          </p>
        </div>

        {/* Mobile bulldog badge */}
        <img
          src="/models/bulldawg.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none h-16 w-16 shrink-0 object-contain drop-shadow-lg sm:hidden"
        />

        {/* Desktop 3D models showcase */}
        <div className="relative hidden h-24 w-64 shrink-0 sm:block md:w-72" aria-hidden="true">
          <img
            src="/models/scholarcap.png"
            alt=""
            className="pointer-events-none absolute -bottom-5 left-0 h-28 w-28 object-contain drop-shadow-md"
          />
          <img
            src="/models/bulldawg.png"
            alt=""
            className="pointer-events-none absolute -top-2 right-16 h-28 w-28 object-contain drop-shadow-lg"
          />
          <img
            src="/models/backpack.png"
            alt=""
            className="pointer-events-none absolute -right-3 -bottom-2 h-20 w-20 object-contain drop-shadow-md"
          />
        </div>
      </div>
    </section>
  )
}
