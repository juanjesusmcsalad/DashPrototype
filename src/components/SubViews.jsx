import { useState } from 'react'
import {
  GradeTrendLineChart,
  SubjectBarChart,
  TaskCompletionDoughnut,
  WeeklyEngagementBarChart,
} from './Charts'

export function AcademicProgressView({ data, searchQuery, onUpdateGrade }) {
  const query = searchQuery.trim().toLowerCase()
  const subjects = data.subjects.filter((s) =>
    query
      ? s.name.toLowerCase().includes(query) ||
        s.shortName.toLowerCase().includes(query) ||
        s.teacher.toLowerCase().includes(query)
      : true
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Academic Progress</h1>
          <p className="text-xs text-slate-500">
            Track subject grades, completion progress, and monthly average growth.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Grades by Subject</h2>
          <SubjectBarChart subjects={data.subjects} />
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Monthly Grade Trajectory</h2>
          <GradeTrendLineChart gradeHistory={data.gradeHistory} />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-900">Enrolled Subjects</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{subject.name}</p>
                <p className="text-xs text-slate-500">{subject.teacher}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32">
                  <div className="mb-1 flex justify-between text-[11px] text-slate-500">
                    <span>Module Progress</span>
                    <span>{subject.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#35408e]"
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  Grade:
                  <input
                    type="number"
                    min="60"
                    max="100"
                    value={subject.grade}
                    onChange={(e) => onUpdateGrade(subject.id, Number(e.target.value))}
                    className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-center text-xs font-bold text-[#35408e] outline-none focus:border-[#35408e]"
                  />
                </label>
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
      dueDate: 'Dec 10, 2026',
      completed: false,
    })
    setTitle('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tasks</h1>
          <p className="text-xs text-slate-500">
            {completedCount} of {data.tasks.length} tasks completed — updates your dashboard KPI automatically.
          </p>
        </div>

        <div className="flex gap-1.5 rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-100">
          {['all', 'pending', 'completed'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold capitalize transition ${
                filter === tab
                  ? 'bg-[#35408e] text-white'
                  : 'text-slate-600 hover:bg-[#eef0fb] hover:text-[#35408e]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new assignment or research task..."
          className="min-w-52 flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#35408e]"
        />
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#35408e]"
        >
          {data.subjects.map((s) => (
            <option key={s.id} value={s.shortName}>
              {s.shortName}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-[#35408e] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#262f6d]"
        >
          Add Task
        </button>
      </form>

      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white shadow-sm">
        {filteredTasks.map((task) => (
          <label
            key={task.id}
            className="flex cursor-pointer items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-[#eef0fb]/50"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleTask(task.id)}
                className="h-4 w-4 rounded accent-[#35408e]"
              />
              <div>
                <p
                  className={`text-sm font-medium ${
                    task.completed ? 'text-slate-400 line-through' : 'text-slate-900'
                  }`}
                >
                  {task.title}
                </p>
                <p className="text-xs text-slate-500">
                  {task.subject} • Due {task.dueDate}
                </p>
              </div>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                task.completed
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {task.completed ? 'Done' : 'Pending'}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

export function PerformanceInsightsView({ data }) {
  const sorted = [...data.subjects].sort((a, b) => b.grade - a.grade)
  const topSubject = sorted[0]
  const focusSubject = sorted[sorted.length - 1]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Performance Insights</h1>
        <p className="text-xs text-slate-500">
          Strengths, focus areas, and personalized study recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#35408e]/30 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-[#35408e] uppercase">Strongest Subject</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{topSubject?.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            Current grade: <span className="font-bold text-slate-800">{topSubject?.grade}%</span>
          </p>
        </div>
        <div className="rounded-2xl border border-[#ffd41c] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-[#b38f00] uppercase">Needs Extra Focus</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{focusSubject?.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            Current grade: <span className="font-bold text-slate-800">{focusSubject?.grade}%</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Subject Comparison</h2>
          <SubjectBarChart subjects={data.subjects} />
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Personalized Recommendations</h2>
          <ul className="space-y-3">
            {data.recommendations.map((rec) => (
              <li
                key={rec.id}
                className="flex items-center justify-between rounded-xl bg-[#eef0fb]/70 px-4 py-3 text-sm font-medium text-slate-800"
              >
                <span>{rec.text}</span>
                <span className="rounded-full bg-[#ffd41c]/30 px-2.5 py-0.5 text-[11px] font-bold text-[#35408e]">
                  {rec.category}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export function EngagementAnalyticsView({ data }) {
  const completedCount = data.tasks.filter((t) => t.completed).length
  const pendingCount = data.tasks.length - completedCount
  const totalStudyHours = data.weeklyEngagement.studyHours.reduce((a, b) => a + b, 0).toFixed(1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Engagement Analytics</h1>
        <p className="text-xs text-slate-500">
          Weekly study hours, attendance consistency, and task completion ratio.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Weekly Study Hours</p>
          <p className="mt-1 text-2xl font-bold text-[#35408e]">{totalStudyHours} hrs</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Attendance Rate</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{data.student.attendanceRate}%</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Task Completion</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {Math.round((completedCount / Math.max(1, data.tasks.length)) * 100)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Study Hours vs Weekly Target</h2>
          <WeeklyEngagementBarChart weeklyEngagement={data.weeklyEngagement} />
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-900">Task Completion</h2>
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
        <h1 className="text-xl font-bold text-slate-900">Announcements</h1>
        <p className="text-xs text-slate-500">Updates from your CT Senior High advisers and teachers.</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-[#ffd41c]/30 px-3 py-0.5 text-xs font-bold text-[#35408e]">
                {item.tag}
              </span>
              <span className="text-xs text-slate-400">{item.date}</span>
            </div>
            <h2 className="mt-2 text-base font-bold text-slate-900">{item.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{item.body}</p>
            <p className="mt-3 text-xs font-medium text-slate-400">Posted by {item.author}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

export function ScheduleView({ data }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Class Schedule</h1>
        <p className="text-xs text-slate-500">Weekly Senior High School timetable.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.schedule.map((slot) => (
          <div key={slot.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wide text-[#35408e] uppercase">
                {slot.day}
              </span>
              <span className="rounded-full bg-[#ffd41c]/30 px-2.5 py-0.5 text-xs font-semibold text-[#35408e]">
                {slot.room}
              </span>
            </div>
            <p className="mt-2 text-sm font-bold text-slate-900">{slot.subject}</p>
            <p className="mt-0.5 text-xs text-slate-500">{slot.time}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProfileView({ data, syncStatus, onSeedFirestore, seedingMessage }) {
  const { student } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Student Profile</h1>
        <p className="text-xs text-slate-500">Student details and Firebase Firestore connection status.</p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400">Full Name</p>
            <p className="text-sm font-bold text-slate-900">{student.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">School</p>
            <p className="text-sm font-bold text-slate-900">{student.school}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Strand / Track</p>
            <p className="text-sm font-semibold text-slate-800">{student.strand}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Student ID</p>
            <p className="text-sm font-semibold text-slate-800">{student.studentNumber}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Email</p>
            <p className="text-sm font-semibold text-slate-800">{student.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Class Adviser</p>
            <p className="text-sm font-semibold text-slate-800">{student.adviser}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#35408e]/25 bg-[#eef0fb]/70 p-5">
        <h2 className="text-sm font-bold text-slate-900">Firebase Firestore Status</h2>
        <p className="mt-1 text-xs text-slate-600">
          Current mode:{' '}
          <span className="font-bold text-[#35408e]">
            {syncStatus.mode === 'firestore' ? 'Connected to Firestore (Live)' : 'Local Demo Mode'}
          </span>
        </p>
        {syncStatus.error && (
          <p className="mt-1 text-xs text-rose-600">Note: {syncStatus.error}</p>
        )}
        <p className="mt-2 text-xs text-slate-500">
          Add your <code className="rounded bg-white px-1 py-0.5">VITE_FIREBASE_*</code> keys in{' '}
          <code className="rounded bg-white px-1 py-0.5">.env</code> (locally) or Vercel Environment
          Variables (production) to enable live Firestore sync.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSeedFirestore}
            className="rounded-xl bg-[#35408e] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#262f6d]"
          >
            Seed / Reset Demo Data in Firestore
          </button>
          {seedingMessage && <span className="text-xs font-medium text-slate-700">{seedingMessage}</span>}
        </div>
      </div>
    </div>
  )
}
