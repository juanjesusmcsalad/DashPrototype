export default function WelcomeBanner({ firstName, displayDate }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4f5ec4] via-[#35408e] to-[#171d4b] px-6 py-6 text-white shadow-lg shadow-[#1b225c]/25 ring-1 ring-white/10 sm:px-8 sm:py-7">
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

        {/* 3D models extracted from Figma node 36:58 */}
        <div className="relative hidden h-36 w-72 shrink-0 sm:block md:w-80" aria-hidden="true">
          <img
            src="/models/scholarcap.png"
            alt=""
            className="pointer-events-none absolute -bottom-8 left-0 h-40 w-40 object-contain drop-shadow-md"
          />
          <img
            src="/models/bulldawg.png"
            alt=""
            className="pointer-events-none absolute -top-3 right-12 h-40 w-40 object-contain drop-shadow-lg"
          />
          <img
            src="/models/backpack.png"
            alt=""
            className="pointer-events-none absolute -right-3 -bottom-4 h-28 w-28 object-contain drop-shadow-md"
          />
        </div>
      </div>
    </section>
  )
}
