import { useState } from 'react'
import {
  downloadStudentCsv,
  formatTaskDueDate,
  getMergedRecommendations,
  resolveGradeHistory,
} from '../utils/academicHelpers'
import {
  GradeTrendLineChart,
  SubjectBarChart,
  TaskCompletionDoughnut,
  WeeklyEngagementBarChart,
} from './Charts'

const CARD = 'rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-700/70 dark:bg-[#181e38]'

export function AcademicProgressView({ data, searchQuery }) {
  const query = searchQuery.trim().toLowerCase()
  const subjects = data.subjects.filter((s) =>
    query
      ? s.name.toLowerCase().includes(query) ||
        s.shortName.toLowerCase().includes(query) ||
        s.teacher.toLowerCase().includes(query)
      : true
  )

  const average =
    data.subjects.length > 0
      ? (
          data.subjects.reduce((sum, s) => sum + Number(s.grade || 0), 0) /
          data.subjects.length
        ).toFixed(2)
      : '0.00'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Academic Progress</h1>
            <span className="rounded-full bg-[#eef0fb] px-3 py-0.5 text-xs font-bold text-[#35408e] dark:bg-[#232b52] dark:text-[#ffd41c]">
              Average: {average}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Track official subject grades, completion progress, and export your summary report.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadStudentCsv(data)}
            className="rounded-xl border border-[#35408e]/30 bg-white px-3.5 py-2 text-xs font-bold text-[#35408e] shadow-sm hover:bg-[#eef0fb] dark:border-slate-700 dark:bg-[#181e38] dark:text-[#ffd41c] dark:hover:bg-[#232b52]"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl bg-[#35408e] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#262f6d] dark:bg-[#ffd41c] dark:text-[#232b66]"
          >
            Print Summary
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={`${CARD} p-5`}>
          <h2 className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Grades by Subject</h2>
          <SubjectBarChart subjects={data.subjects} />
        </div>
        <div className={`${CARD} p-5`}>
          <h2 className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Monthly Grade Trajectory</h2>
          <GradeTrendLineChart gradeHistory={resolveGradeHistory(data.gradeHistory, data.subjects)} />
        </div>
      </div>

      <div className={`${CARD} overflow-hidden`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700/70">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Enrolled Subjects</h2>
          <span className="text-[11px] text-slate-400">Official grades updated by Administrator</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{subject.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{subject.teacher}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden w-28 sm:block">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-[#35408e] dark:bg-[#ffd41c]"
                      style={{ width: `${Math.min(100, Math.max(0, Number(subject.grade || 0)))}%` }}
                    />
                  </div>
                </div>
                <span className="rounded-lg bg-[#eef0fb] px-3 py-1 text-xs font-bold text-[#35408e] dark:bg-[#232b52] dark:text-[#ffd41c]">
                  {subject.grade}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function TasksView({ data, searchQuery, onToggleTask, onAddTask }) {
  const [filter, setFilter] = useState('all')
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState(data.subjects[0]?.shortName || 'Research')
  const [dueDate, setDueDate] = useState('')

  const query = searchQuery.trim().toLowerCase()
  const filteredTasks = data.tasks.filter((task) => {
    const matchesSearch = query
      ? task.title.toLowerCase().includes(query) || task.subject.toLowerCase().includes(query)
      : true
    const matchesFilter =
      filter === 'all' ? true : filter === 'pending' ? !task.completed : task.completed
    return matchesSearch && matchesFilter
  })

  const completedCount = data.tasks.filter((t) => t.completed).length

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onAddTask({
      id: `t-${Date.now()}`,
      title: title.trim(),
      subject,
      dueDate: formatTaskDueDate(dueDate),
      completed: false,
    })
    setTitle('')
    setDueDate('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Tasks</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {completedCount} of {data.tasks.length} tasks completed — updates your dashboard KPI automatically.
          </p>
        </div>

        <div className="flex gap-1.5 rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-100 dark:bg-[#181e38] dark:ring-slate-700">
          {['all', 'pending', 'completed'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold capitalize transition-all duration-200 ease-out ${
                filter === tab
                  ? 'bg-gradient-to-r from-[#424fa6] to-[#20275e] text-white shadow-sm dark:from-[#ffd41c] dark:to-[#f2b800] dark:text-[#232b66]'
                  : 'text-slate-600 hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-[#eef0fb] hover:to-[#e2e7fb] hover:text-[#35408e] dark:text-slate-300 dark:hover:from-white/10 dark:hover:to-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`${CARD} flex flex-wrap gap-3 p-4`}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new assignment or research task..."
          className="min-w-52 flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
        />
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
        >
          {data.subjects.map((s) => (
            <option key={s.id} value={s.shortName}>
              {s.shortName}
            </option>
          ))}
        </select>
        <input
          type="date"
          aria-label="Task due date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
        />
        <button
          type="submit"
          className="rounded-xl bg-[#35408e] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#262f6d] dark:bg-[#ffd41c] dark:text-[#232b66]"
        >
          Add Task
        </button>
      </form>

      <div className={`${CARD} divide-y divide-slate-100 dark:divide-slate-700/60`}>
        {filteredTasks.length === 0 ? (
          <p className="px-5 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            No tasks assigned yet. Add one above or wait for your administrator to assign tasks.
          </p>
        ) : (
          filteredTasks.map((task) => (
            <label
              key={task.id}
              className="flex cursor-pointer items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-[#eef0fb]/50 dark:hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleTask(task.id)}
                  className="h-4 w-4 rounded accent-[#35408e] dark:accent-[#ffd41c]"
                />
                <div>
                  <p
                    className={`text-sm font-medium ${
                      task.completed
                        ? 'text-slate-400 line-through dark:text-slate-500'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {task.subject} •{' '}
                    {!task.dueDate || task.dueDate === 'No due date' ? 'No due date' : `Due ${task.dueDate}`}
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  task.completed
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {task.completed ? 'Done' : 'Pending'}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  )
}

export function PerformanceInsightsView({ data }) {
  const hasRecordedGrades = data.subjects.some((s) => Number(s.grade || 0) > 0)
  const sorted = [...data.subjects].sort((a, b) => Number(b.grade || 0) - Number(a.grade || 0))
  const topSubject = sorted[0]
  const focusSubject = sorted[sorted.length - 1]
  const recommendations = getMergedRecommendations(data)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Performance Insights</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Strengths, focus areas, and personalized study recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#35408e]/30 bg-white p-5 shadow-sm dark:border-[#4c59b5] dark:bg-[#181e38]">
          <p className="text-xs font-semibold text-[#35408e] uppercase dark:text-[#ffd41c]">Strongest Subject</p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            {hasRecordedGrades ? topSubject?.name : 'Not yet graded'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Current grade:{' '}
            <span className="font-bold text-slate-800 dark:text-slate-100">
              {hasRecordedGrades ? topSubject?.grade : 0}%
            </span>
          </p>
        </div>
        <div className="rounded-2xl border border-[#ffd41c] bg-white p-5 shadow-sm dark:border-[#ffd41c]/60 dark:bg-[#181e38]">
          <p className="text-xs font-semibold text-[#b38f00] uppercase dark:text-[#ffd41c]">Needs Extra Focus</p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            {hasRecordedGrades ? focusSubject?.name : 'Not yet graded'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Current grade:{' '}
            <span className="font-bold text-slate-800 dark:text-slate-100">
              {hasRecordedGrades ? focusSubject?.grade : 0}%
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={`${CARD} p-5`}>
          <h2 className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Subject Comparison</h2>
          <SubjectBarChart subjects={data.subjects} />
        </div>
        <div className={`${CARD} p-5`}>
          <h2 className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Personalized Recommendations</h2>
          {recommendations.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">No recommendations yet.</p>
          ) : (
            <ul className="space-y-3">
              {recommendations.map((rec) => (
                <li
                  key={rec.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[#eef0fb]/70 px-4 py-3 text-sm font-medium text-slate-800 dark:bg-[#11162b] dark:text-slate-100"
                >
                  <span>{rec.text}</span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {rec.isAuto && (
                      <span className="rounded-full bg-[#35408e]/10 px-2 py-0.5 text-[10px] font-bold text-[#35408e] dark:bg-white/10 dark:text-slate-300">
                        Auto
                      </span>
                    )}
                    <span className="rounded-full bg-[#ffd41c]/30 px-2.5 py-0.5 text-[11px] font-bold text-[#35408e] dark:text-[#ffd41c]">
                      {rec.category}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export function EngagementAnalyticsView({ data, onLogStudyHours }) {
  const [dayIndex, setDayIndex] = useState(0)
  const [hours, setHours] = useState('1.0')
  const completedCount = data.tasks.filter((t) => t.completed).length
  const pendingCount = data.tasks.length - completedCount
  const totalStudyHours = data.weeklyEngagement.studyHours.reduce((a, b) => a + b, 0).toFixed(1)

  const handleLogSubmit = (e) => {
    e.preventDefault()
    const num = parseFloat(hours)
    if (Number.isNaN(num) || num <= 0) return
    onLogStudyHours?.(Number(dayIndex), num)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Engagement Analytics</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Weekly study hours, attendance consistency, and task completion ratio.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={`${CARD} p-5`}>
          <p className="text-xs text-slate-500 dark:text-slate-400">Weekly Study Hours</p>
          <p className="mt-1 text-2xl font-bold text-[#35408e] dark:text-[#ffd41c]">{totalStudyHours} hrs</p>
        </div>
        <div className={`${CARD} p-5`}>
          <p className="text-xs text-slate-500 dark:text-slate-400">Attendance Rate</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{data.student.attendanceRate ?? 0}%</p>
        </div>
        <div className={`${CARD} p-5`}>
          <p className="text-xs text-slate-500 dark:text-slate-400">Task Completion</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {Math.round((completedCount / Math.max(1, data.tasks.length)) * 100)}%
          </p>
        </div>
      </div>

      <form onSubmit={handleLogSubmit} className={`${CARD} flex flex-wrap items-center gap-3 p-4`}>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Log Study Session:</span>
        <select
          value={dayIndex}
          onChange={(e) => setDayIndex(Number(e.target.value))}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
        >
          {data.weeklyEngagement.labels.map((label, idx) => (
            <option key={label} value={idx}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.5"
          min="0.5"
          max="8"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="w-24 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
        />
        <span className="text-xs text-slate-500 dark:text-slate-400">hours</span>
        <button
          type="submit"
          className="rounded-xl bg-[#35408e] px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#262f6d] dark:bg-[#ffd41c] dark:text-[#232b66]"
        >
          Add Study Hours
        </button>
      </form>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`${CARD} p-5 lg:col-span-2`}>
          <h2 className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Study Hours vs Weekly Target</h2>
          <WeeklyEngagementBarChart weeklyEngagement={data.weeklyEngagement} />
        </div>
        <div className={`${CARD} p-5`}>
          <h2 className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Task Completion</h2>
          <TaskCompletionDoughnut completedCount={completedCount} pendingCount={pendingCount} />
        </div>
      </div>
    </div>
  )
}

export function AnnouncementsView({ data, searchQuery }) {
  const query = searchQuery.trim().toLowerCase()
  const items = data.announcements.filter((a) =>
    query
      ? a.title.toLowerCase().includes(query) ||
        a.body.toLowerCase().includes(query) ||
        a.tag.toLowerCase().includes(query)
      : true
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Announcements</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Updates from your NU MOA CT Senior High advisers and teachers.</p>
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className={`${CARD} p-6 text-center text-xs text-slate-500 dark:text-slate-400`}>
            No announcements posted yet.
          </div>
        ) : (
          items.map((item) => (
            <article key={item.id} className={`${CARD} p-5`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-[#ffd41c]/30 px-3 py-0.5 text-xs font-bold text-[#35408e] dark:text-[#ffd41c]">
                  {item.tag}
                </span>
                <span className="text-xs text-slate-400">{item.date}</span>
              </div>
              <h2 className="mt-2 text-base font-bold text-slate-900 dark:text-white">{item.title}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.body}</p>
              <p className="mt-3 text-xs font-medium text-slate-400">Posted by {item.author}</p>
            </article>
          ))
        )}
      </div>
    </div>
  )
}

export function ScheduleView({ data }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Class Schedule</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Weekly Senior High School timetable.</p>
      </div>
      {data.schedule.length === 0 ? (
        <div className={`${CARD} p-6 text-center text-xs text-slate-500 dark:text-slate-400`}>
          No class schedule configured yet. Your administrator can set up your section timetable.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.schedule.map((slot) => (
            <div key={slot.id} className={`${CARD} p-4`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wide text-[#35408e] uppercase dark:text-[#ffd41c]">
                  {slot.day}
                </span>
                {slot.room && (
                  <span className="rounded-full bg-[#ffd41c]/30 px-2.5 py-0.5 text-xs font-semibold text-[#35408e] dark:text-[#ffd41c]">
                    {slot.room}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{slot.subject}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{slot.time}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ProfileView({ data }) {
  const { student } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Student Profile</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Your student account details.</p>
      </div>

      <div className={`${CARD} p-6`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400">Full Name</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{student.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">School</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{student.school}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Section</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {student.section || '12SHS2510'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Email</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{student.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
