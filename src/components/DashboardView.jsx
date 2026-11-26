import { GradeTrendLineChart } from './Charts'
import WelcomeBanner from './WelcomeBanner'

function StatCard({ value, label, highlighted = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded-2xl bg-white px-4 py-7 text-center transition hover:-translate-y-0.5 ${
        highlighted
          ? 'border-2 border-[#35408e] shadow-[0_10px_28px_rgba(53,64,142,0.12)]'
          : 'border border-slate-100 shadow-[0_8px_24px_rgba(15,23,42,0.05)] hover:border-[#ffd41c]'
      }`}
    >
      <span className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{value}</span>
      <span className="mt-1.5 text-xs font-medium text-slate-500">{label}</span>
    </button>
  )
}

export default function DashboardView({ data, searchQuery, onNavigate }) {
  const { student, subjects, tasks, recommendations, gradeHistory } = data

  const averageGrade =
    subjects.length > 0
      ? (subjects.reduce((sum, s) => sum + Number(s.grade || 0), 0) / subjects.length).toFixed(2)
      : '0.00'

  const completedTasks = tasks.filter((t) => t.completed).length
  const totalTasks = tasks.length

  const query = searchQuery.trim().toLowerCase()
  const filteredSubjects = subjects.filter((s) =>
    query ? s.name.toLowerCase().includes(query) || s.shortName.toLowerCase().includes(query) : true
  )
  const filteredRecommendations = recommendations.filter((r) =>
    query ? r.text.toLowerCase().includes(query) || r.category.toLowerCase().includes(query) : true
  )

  return (
    <div className="space-y-6">
      <WelcomeBanner firstName={student.firstName} displayDate={student.displayDate} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left Main Area */}
        <div className="space-y-6 xl:col-span-8">
          {/* Academic Overview */}
          <section>
            <h2 className="mb-3 text-base font-bold text-slate-900">Academic Overview</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                value={averageGrade}
                label="Current Grade Average"
                onClick={() => onNavigate('academic-progress')}
              />
              <StatCard
                value={`${student.attendanceRate}%`}
                label="Attendance Rate"
                highlighted
                onClick={() => onNavigate('engagement-analytics')}
              />
              <StatCard
                value={`${completedTasks}/${totalTasks}`}
                label="Tasks Completed"
                onClick={() => onNavigate('tasks')}
              />
            </div>
          </section>

          {/* Enrolled Courses */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Enrolled Courses</h2>
              <button
                type="button"
                onClick={() => onNavigate('academic-progress')}
                className="text-xs font-semibold text-[#35408e] hover:text-[#242c66]"
              >
                See all
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Academic Progress Card */}
              <div className="flex items-center justify-between rounded-2xl border-2 border-[#35408e]/85 bg-[#eef0fb] p-5 shadow-sm">
                <div>
                  <h3 className="text-sm font-bold leading-snug text-[#35408e]">
                    Academic
                    <br />
                    Progress
                  </h3>
                  <button
                    type="button"
                    onClick={() => onNavigate('academic-progress')}
                    className="mt-4 rounded-full bg-[#35408e] px-6 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#262f6d]"
                  >
                    View
                  </button>
                </div>

                {/* Laptop graphic */}
                <svg className="h-20 w-24 shrink-0" viewBox="0 0 110 90" fill="none" aria-hidden="true">
                  <rect x="20" y="14" width="70" height="46" rx="5" fill="#DCE1F8" stroke="#35408e" strokeWidth="2" />
                  <rect x="26" y="20" width="58" height="34" rx="2" fill="#FFFFFF" />
                  <rect x="33" y="27" width="26" height="5" rx="2.5" fill="#FFD41C" />
                  <rect x="33" y="36" width="40" height="4" rx="2" fill="#35408e" opacity="0.3" />
                  <path d="M12 64h86l-6 10H18l-6-10z" fill="#C7CEEF" />
                  <rect x="44" y="67" width="22" height="3" rx="1.5" fill="#35408e" />
                </svg>
              </div>

              {/* Engagement Analytics Card */}
              <div className="flex items-center justify-between rounded-2xl border border-[#ffd41c] bg-[#fff9dc] p-5 shadow-sm">
                <div>
                  <h3 className="text-sm font-bold leading-snug text-[#35408e]">
                    Engagement Analytics
                  </h3>
                  <button
                    type="button"
                    onClick={() => onNavigate('engagement-analytics')}
                    className="mt-5 rounded-full bg-[#ffd41c] px-6 py-1.5 text-xs font-bold text-[#232b66] shadow-sm transition hover:brightness-95"
                  >
                    View
                  </button>
                </div>

                {/* Pie + Bar chart graphic */}
                <svg className="h-20 w-24 shrink-0" viewBox="0 0 110 90" fill="none" aria-hidden="true">
                  <circle cx="36" cy="36" r="18" fill="#DCE1F8" />
                  <path d="M36 36V18a18 18 0 0 1 16 10L36 36z" fill="#FFD41C" />
                  <rect x="46" y="62" width="8" height="16" rx="2" fill="#9AA4DB" />
                  <rect x="59" y="52" width="8" height="26" rx="2" fill="#6874C4" />
                  <rect x="72" y="42" width="8" height="36" rx="2" fill="#35408e" />
                  <rect x="85" y="28" width="8" height="50" rx="2" fill="#FFD41C" />
                </svg>
              </div>
            </div>
          </section>

          {/* Compact Chart.js Preview on Dashboard */}
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Grade Average Trend</h2>
                <p className="text-xs text-slate-500">Monthly academic trajectory (Chart.js)</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('performance-insights')}
                className="text-xs font-semibold text-[#35408e] hover:text-[#242c66]"
              >
                Full insights
              </button>
            </div>
            <GradeTrendLineChart gradeHistory={gradeHistory} />
          </section>
        </div>

        {/* Right Column: Subject Performance & Recommendations */}
        <aside className="space-y-6 xl:col-span-4">
          {/* Subject Performance */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Subject Performance</h2>
              <button
                type="button"
                onClick={() => onNavigate('academic-progress')}
                className="text-xs font-semibold text-[#35408e] hover:text-[#242c66]"
              >
                Details
              </button>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              {filteredSubjects.length === 0 ? (
                <p className="text-xs text-slate-500">No subjects match "{searchQuery}".</p>
              ) : (
                filteredSubjects.slice(0, 4).map((subject) => (
                  <div key={subject.id}>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>{subject.shortName}</span>
                      <span className="text-[#35408e]">{subject.grade}%</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/80">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#35408e] to-[#5260bd] transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, subject.progress))}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Recommendations */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Recommendations</h2>
              <button
                type="button"
                onClick={() => onNavigate('performance-insights')}
                className="text-xs font-semibold text-[#35408e] hover:text-[#242c66]"
              >
                See all
              </button>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
              <h3 className="text-xs font-bold text-slate-900">Personalized Recommendations</h3>
              <ul className="mt-4 space-y-3.5">
                {filteredRecommendations.length === 0 ? (
                  <li className="text-xs text-slate-500">No matching recommendations.</li>
                ) : (
                  filteredRecommendations.map((rec) => (
                    <li key={rec.id} className="flex items-start gap-2.5 text-xs font-semibold text-slate-800">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#ffd41c] ring-1 ring-[#35408e]/40" />
                      <span>{rec.text}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
