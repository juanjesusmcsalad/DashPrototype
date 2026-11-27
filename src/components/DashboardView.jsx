import { getMergedRecommendations } from '../utils/academicHelpers'
import { SubjectBarChart } from './Charts'
import WelcomeBanner from './WelcomeBanner'

function StatCard({ value, label, highlighted = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col items-center justify-center rounded-2xl px-2.5 py-4 text-center transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg sm:px-4 sm:py-7 ${
        highlighted
          ? 'border-2 border-[#35408e] bg-white shadow-[0_10px_28px_rgba(53,64,142,0.12)] dark:border-[#ffd41c] dark:bg-[#181e38]'
          : 'border border-slate-100 bg-gradient-to-br from-white to-[#f6f8ff] shadow-[0_8px_24px_rgba(15,23,42,0.05)] hover:border-[#ffd41c] dark:border-slate-700/70 dark:from-[#1b2240] dark:to-[#131830]'
      }`}
    >
      <span className="text-lg font-bold tracking-tight text-slate-900 transition-all duration-200 ease-out group-hover:scale-110 group-hover:text-[#35408e] sm:text-2xl dark:text-white dark:group-hover:text-[#ffd41c]">
        {value}
      </span>
      <span className="mt-1 text-[11px] font-medium leading-tight text-slate-500 transition-colors duration-200 group-hover:text-slate-700 sm:mt-1.5 sm:text-xs dark:text-slate-400 dark:group-hover:text-slate-200">
        {label}
      </span>
    </button>
  )
}

export default function DashboardView({ data, searchQuery, onNavigate }) {
  const { student, subjects, tasks } = data
  const recommendations = getMergedRecommendations(data)

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
          <section data-tour="student-overview">
            <h2 className="mb-3 text-base font-bold text-slate-900 dark:text-slate-100">Academic Overview</h2>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              <StatCard
                value={averageGrade}
                label="Current Grade Average"
                onClick={() => onNavigate('academic-progress')}
              />
              <StatCard
                value={`${student.attendanceRate ?? 0}%`}
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
              <div className="group flex items-center justify-between rounded-2xl border-2 border-[#35408e]/85 bg-gradient-to-br from-[#f2f4ff] via-[#e7ebfd] to-[#d6ddfb] p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-[#4c59b5] dark:from-[#26315e] dark:via-[#1e2647] dark:to-[#151b36]">
                <div>
                  <h3 className="origin-left text-sm font-bold leading-snug text-[#35408e] transition-transform duration-200 ease-out group-hover:scale-105 dark:text-white">
                    Academic
                    <br />
                    Progress
                  </h3>
                  <button
                    type="button"
                    onClick={() => onNavigate('academic-progress')}
                    className="mt-4 rounded-full bg-gradient-to-r from-[#424fa6] to-[#20275e] px-6 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-[#35408e] hover:to-[#151b45] hover:shadow"
                  >
                    View
                  </button>
                </div>

                <img
                  src="/models/laptop-card.png"
                  alt=""
                  className="h-16 w-16 shrink-0 object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
                />
              </div>

              {/* Engagement Analytics Card */}
              <div className="group flex items-center justify-between rounded-2xl border border-[#ffd41c] bg-[#fff9dc] p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-[#ffd41c]/60 dark:bg-[#272318]">
                <div>
                  <h3 className="origin-left text-sm font-bold leading-snug text-[#35408e] transition-transform duration-200 ease-out group-hover:scale-105 dark:text-[#ffd41c]">
                    Engagement Analytics
                  </h3>
                  <button
                    type="button"
                    onClick={() => onNavigate('engagement-analytics')}
                    className="mt-5 rounded-full bg-[#ffd41c] px-6 py-1.5 text-xs font-bold text-[#232b66] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:brightness-95"
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
          <section data-tour="student-charts" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:border-slate-700/70 dark:bg-[#181e38]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Grades by Subject</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Live breakdown across your 5 enrolled subjects</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('performance-insights')}
                className="text-xs font-semibold text-[#35408e] hover:text-[#242c66] dark:text-[#ffd41c]"
              >
                Full insights
              </button>
            </div>
            <SubjectBarChart subjects={subjects} />
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
                filteredSubjects.map((subject) => (
                  <div key={subject.id}>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-100">
                      <span>{subject.shortName}</span>
                      <span className="text-[#35408e] dark:text-[#ffd41c]">{subject.grade}%</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/80">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#5565d0] via-[#35408e] to-[#1b225c] transition-all duration-300 dark:from-[#ffd41c] dark:to-[#eab308]"
                        style={{ width: `${Math.min(100, Math.max(0, Number(subject.grade || 0)))}%` }}
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
                  <li className="text-xs text-slate-500 dark:text-slate-400">
                    {query ? 'No matching recommendations.' : 'No recommendations yet.'}
                  </li>
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
