import { getHonorsStanding } from '../utils/academicHelpers'
import { GradeTrendLineChart } from './Charts'
import WelcomeBanner from './WelcomeBanner'

function StatCard({ value, label, badge, highlighted = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded-2xl bg-white px-4 py-6 text-center transition hover:-translate-y-0.5 dark:bg-[#181e38] ${
        highlighted
          ? 'border-2 border-[#35408e] shadow-[0_10px_28px_rgba(53,64,142,0.12)] dark:border-[#ffd41c]'
          : 'border border-slate-100 shadow-[0_8px_24px_rgba(15,23,42,0.05)] hover:border-[#ffd41c] dark:border-slate-700/70'
      }`}
    >
      <span className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">{value}</span>
      <span className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      {badge && (
        <span
          className={`mt-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
            badge.achieved
              ? 'bg-[#ffd41c] text-[#232b66]'
              : 'bg-[#eef0fb] text-[#35408e] dark:bg-[#232b52] dark:text-[#ffd41c]'
          }`}
        >
          {badge.label}
        </span>
      )}
    </button>
  )
}

export default function DashboardView({ data, searchQuery, onNavigate }) {
  const { student, subjects, tasks, recommendations, gradeHistory, researchMilestones = [] } = data

  const averageGrade =
    subjects.length > 0
      ? (subjects.reduce((sum, s) => sum + Number(s.grade || 0), 0) / subjects.length).toFixed(2)
      : '0.00'
  const honorsStanding = getHonorsStanding(averageGrade)

  const completedTasks = tasks.filter((t) => t.completed).length
  const totalTasks = tasks.length
  const completedMilestones = researchMilestones.filter((m) => m.completed).length

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
            <h2 className="mb-3 text-base font-bold text-slate-900 dark:text-slate-100">Academic Overview</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                value={averageGrade}
                label="Current Grade Average"
                badge={honorsStanding}
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
                badge={
                  researchMilestones.length > 0
                    ? {
                        label: `Research: ${completedMilestones}/${researchMilestones.length}`,
                        achieved: completedMilestones === researchMilestones.length,
                      }
                    : null
                }
                onClick={() => onNavigate('tasks')}
              />
            </div>
          </section>

          {/* Enrolled Courses */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Enrolled Courses</h2>
              <button
                type="button"
                onClick={() => onNavigate('academic-progress')}
                className="text-xs font-semibold text-[#35408e] hover:text-[#242c66] dark:text-[#ffd41c]"
              >
                See all
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Academic Progress Card */}
              <div className="flex items-center justify-between rounded-2xl border-2 border-[#35408e]/85 bg-[#eef0fb] p-5 shadow-sm dark:border-[#4c59b5] dark:bg-[#1e2647]">
                <div>
                  <h3 className="text-sm font-bold leading-snug text-[#35408e] dark:text-white">
                    Academic
                    <br />
                    Progress
                  </h3>
                  <button
                    type="button"
                    onClick={() => onNavigate('academic-progress')}
                    className="mt-4 rounded-full bg-[#35408e] px-6 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#262f6d] dark:bg-[#4c59b5]"
                  >
                    View
                  </button>
                </div>

                <img
                  src="/models/laptop-card.png"
                  alt=""
                  className="h-16 w-16 shrink-0 object-contain drop-shadow-sm"
                />
              </div>

              {/* Engagement Analytics Card */}
              <div className="flex items-center justify-between rounded-2xl border border-[#ffd41c] bg-[#fff9dc] p-5 shadow-sm dark:border-[#ffd41c]/60 dark:bg-[#272318]">
                <div>
                  <h3 className="text-sm font-bold leading-snug text-[#35408e] dark:text-[#ffd41c]">
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

                <img
                  src="/models/analytics-card.png"
                  alt=""
                  className="h-16 w-16 shrink-0 object-contain drop-shadow-sm"
                />
              </div>
            </div>
          </section>

          {/* Compact Chart.js Preview on Dashboard */}
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:border-slate-700/70 dark:bg-[#181e38]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Grade Average Trend</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Monthly academic trajectory (Chart.js)</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('performance-insights')}
                className="text-xs font-semibold text-[#35408e] hover:text-[#242c66] dark:text-[#ffd41c]"
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
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Subject Performance</h2>
              <button
                type="button"
                onClick={() => onNavigate('academic-progress')}
                className="text-xs font-semibold text-[#35408e] hover:text-[#242c66] dark:text-[#ffd41c]"
              >
                Details
              </button>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:border-slate-700/70 dark:bg-[#181e38]">
              {filteredSubjects.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">No subjects match "{searchQuery}".</p>
              ) : (
                filteredSubjects.slice(0, 4).map((subject) => (
                  <div key={subject.id}>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-100">
                      <span>{subject.shortName}</span>
                      <span className="text-[#35408e] dark:text-[#ffd41c]">{subject.grade}%</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/80">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#35408e] to-[#5260bd] transition-all duration-300 dark:from-[#ffd41c] dark:to-[#eab308]"
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
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Recommendations</h2>
              <button
                type="button"
                onClick={() => onNavigate('performance-insights')}
                className="text-xs font-semibold text-[#35408e] hover:text-[#242c66] dark:text-[#ffd41c]"
              >
                See all
              </button>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)] dark:border-slate-700/70 dark:bg-[#181e38]">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Personalized Recommendations</h3>
              <ul className="mt-4 space-y-3.5">
                {filteredRecommendations.length === 0 ? (
                  <li className="text-xs text-slate-500 dark:text-slate-400">No matching recommendations.</li>
                ) : (
                  filteredRecommendations.map((rec) => (
                    <li key={rec.id} className="flex items-start gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
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
