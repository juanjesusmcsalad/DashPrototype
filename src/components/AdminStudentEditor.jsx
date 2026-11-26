import { useState } from 'react'
import { ALLOWED_SECTIONS } from '../services/authService'
import { downloadStudentCsv } from '../utils/academicHelpers'

export default function AdminStudentEditor({
  studentRecord,
  onSaveStudentInfo,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onSaveWeeklyEngagement,
  onAddRecommendation,
  onDeleteRecommendation,
  onPrevStudent,
  onNextStudent,
  hasPrev,
  hasNext,
}) {
  const [editorTab, setEditorTab] = useState('grades') // 'grades' | 'tasks' | 'notes'
  const [name, setName] = useState(() => studentRecord?.student?.name || '')
  const [section, setSection] = useState(() => studentRecord?.student?.section || '12SHS2510')
  const [attendanceRate, setAttendanceRate] = useState(() =>
    String(studentRecord?.student?.attendanceRate ?? 0)
  )
  const [subjects, setSubjects] = useState(() =>
    (studentRecord?.subjects || []).map((s) => ({
      ...s,
      gradeInput: String(s.grade ?? 0),
    }))
  )
  const [gradeHistoryLabels] = useState(
    () => studentRecord?.gradeHistory?.labels || ['Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  )
  const [gradeHistoryInput, setGradeHistoryInput] = useState(() =>
    (studentRecord?.gradeHistory?.values || [0, 0, 0, 0, 0]).map(String)
  )
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  // Weekly study hours state
  const [studyLabels] = useState(
    () => studentRecord?.weeklyEngagement?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  )
  const [studyHoursInput, setStudyHoursInput] = useState(() =>
    (studentRecord?.weeklyEngagement?.studyHours || [0, 0, 0, 0, 0, 0, 0]).map(String)
  )
  const [targetHoursInput, setTargetHoursInput] = useState(() =>
    (studentRecord?.weeklyEngagement?.targetHours || [0, 0, 0, 0, 0, 0, 0]).map(String)
  )
  const [savingHours, setSavingHours] = useState(false)

  // Task form state
  const [taskTitle, setTaskTitle] = useState('')
  const [taskSubject, setTaskSubject] = useState(
    () => studentRecord?.subjects?.[0]?.shortName || 'Research'
  )
  const [taskDueDate, setTaskDueDate] = useState('Dec 12, 2026')

  // Recommendation state
  const [newRec, setNewRec] = useState('')

  if (!studentRecord) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-500 shadow-sm dark:border-slate-700/70 dark:bg-[#181e38] dark:text-slate-400">
        No students registered yet or none match the selected filter.
      </div>
    )
  }

  const avg =
    subjects.length > 0
      ? (
          subjects.reduce((sum, s) => {
            const val = Number(s.gradeInput)
            return sum + (Number.isNaN(val) ? Number(s.grade || 0) : val)
          }, 0) / subjects.length
        ).toFixed(2)
      : '0.00'

  const handleGradeInputChange = (subjectId, value) => {
    setSubjects((prev) => {
      const nextSubjects = prev.map((s) => (s.id === subjectId ? { ...s, gradeInput: value } : s))
      if (nextSubjects.length > 0) {
        const nextAvg = (
          nextSubjects.reduce((sum, s) => {
            const val = Number(s.gradeInput)
            return sum + (Number.isNaN(val) ? Number(s.grade || 0) : Math.min(100, Math.max(0, val)))
          }, 0) / nextSubjects.length
        ).toFixed(2)
        setGradeHistoryInput((histPrev) => {
          const updated = [...histPrev]
          if (updated.length > 0) {
            updated[updated.length - 1] = String(Number(nextAvg))
          }
          return updated
        })
      }
      return nextSubjects
    })
    setIsDirty(true)
  }

  const handleSaveInfo = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const cleanName = name.trim() || studentRecord.student?.name || 'Student'
      const firstName = cleanName.split(/\s+/)[0] || 'Student'
      const rawAtt = Number(attendanceRate)
      const parsedAttendance =
        attendanceRate.trim() === '' || Number.isNaN(rawAtt)
          ? Number(studentRecord.student?.attendanceRate ?? 0)
          : Math.min(100, Math.max(0, Math.round(rawAtt)))

      const cleanedSubjects = subjects.map(({ gradeInput, ...rest }) => {
        const rawGrade = Number(gradeInput)
        return {
          ...rest,
          grade:
            gradeInput.trim() === '' || Number.isNaN(rawGrade)
              ? Number(rest.grade ?? 0)
              : Math.min(100, Math.max(0, rawGrade)),
        }
      })

      const cleanedHistory = gradeHistoryLabels.map((_, idx) => {
        const rawVal = Number(gradeHistoryInput[idx])
        if (gradeHistoryInput[idx]?.trim() === '' || Number.isNaN(rawVal)) return 0
        return Math.min(100, Math.max(0, Number(rawVal.toFixed(2))))
      })

      await onSaveStudentInfo(studentRecord.id, {
        student: {
          ...studentRecord.student,
          name: cleanName,
          firstName,
          section,
          strand: `Grade 12 — Section ${section}`,
          attendanceRate: parsedAttendance,
        },
        subjects: cleanedSubjects,
        gradeHistory: {
          labels: gradeHistoryLabels,
          values: cleanedHistory,
        },
      })
      setIsDirty(false)
    } finally {
      setSaving(false)
    }
  }

  const handleAddTaskSubmit = async (e) => {
    e.preventDefault()
    if (!taskTitle.trim()) return
    await onAddTask(studentRecord.id, {
      id: `t-${Date.now()}`,
      title: taskTitle.trim(),
      subject: taskSubject,
      dueDate: taskDueDate.trim() || 'Dec 12, 2026',
      completed: false,
    })
    setTaskTitle('')
  }

  const handleAddRecSubmit = async (e) => {
    e.preventDefault()
    if (!newRec.trim()) return
    await onAddRecommendation(studentRecord.id, newRec.trim())
    setNewRec('')
  }

  const handleSaveHours = async (e) => {
    e.preventDefault()
    setSavingHours(true)
    try {
      const cleanedStudy = studyHoursInput.map((val) =>
        Math.min(16, Math.max(0, Number(Number(val) || 0).toFixed(1)))
      )
      const cleanedTarget = targetHoursInput.map((val) =>
        Math.min(16, Math.max(0, Number(Number(val) || 0).toFixed(1)))
      )
      await onSaveWeeklyEngagement(studentRecord.id, {
        labels: studyLabels,
        studyHours: cleanedStudy,
        targetHours: cleanedTarget,
      })
    } finally {
      setSavingHours(false)
    }
  }

  const tasks = studentRecord.tasks || []
  const pendingCount = tasks.filter((t) => !t.completed).length
  const recommendations = studentRecord.recommendations || []
  const totalStudyHours = studyHoursInput
    .reduce((sum, val) => sum + (Number(val) || 0), 0)
    .toFixed(1)

  return (
    <div className="space-y-4">
      {/* Header & Rapid Prev/Next Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-700/70">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {studentRecord.student?.name}
            </h2>
            <span className="rounded-full bg-[#ffd41c]/35 px-2.5 py-0.5 text-[11px] font-bold text-[#35408e] dark:text-[#ffd41c]">
              {studentRecord.student?.section || '12SHS2510'}
            </span>
            <span className="rounded-full bg-[#eef0fb] px-2.5 py-0.5 text-[11px] font-semibold text-[#35408e] dark:bg-[#232b52] dark:text-slate-200">
              Avg: {avg}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {studentRecord.student?.email} • {studentRecord.student?.studentNumber}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            disabled={!hasPrev}
            onClick={onPrevStudent}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-[#35408e] disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
          >
            ← Prev
          </button>
          <button
            type="button"
            disabled={!hasNext}
            onClick={onNextStudent}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-[#35408e] disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
          >
            Next →
          </button>
          <button
            type="button"
            onClick={() => downloadStudentCsv(studentRecord)}
            className="rounded-lg border border-[#35408e]/30 px-2.5 py-1 text-xs font-bold text-[#35408e] hover:bg-[#eef0fb] dark:border-slate-700 dark:text-[#ffd41c] dark:hover:bg-[#232b52]"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Editor Sub-tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setEditorTab('grades')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
            editorTab === 'grades'
              ? 'bg-[#35408e] text-white dark:bg-[#ffd41c] dark:text-[#232b66]'
              : 'bg-[#f5f6fb] text-slate-600 hover:bg-[#eef0fb] dark:bg-[#11162b] dark:text-slate-300'
          }`}
        >
          Grades &amp; Info {isDirty ? '•' : ''}
        </button>
        <button
          type="button"
          onClick={() => setEditorTab('tasks')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
            editorTab === 'tasks'
              ? 'bg-[#35408e] text-white dark:bg-[#ffd41c] dark:text-[#232b66]'
              : 'bg-[#f5f6fb] text-slate-600 hover:bg-[#eef0fb] dark:bg-[#11162b] dark:text-slate-300'
          }`}
        >
          Tasks ({pendingCount} pending)
        </button>
        <button
          type="button"
          onClick={() => setEditorTab('notes')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
            editorTab === 'notes'
              ? 'bg-[#35408e] text-white dark:bg-[#ffd41c] dark:text-[#232b66]'
              : 'bg-[#f5f6fb] text-slate-600 hover:bg-[#eef0fb] dark:bg-[#11162b] dark:text-slate-300'
          }`}
        >
          Study Hours &amp; Notes
        </button>
      </div>

      {/* Tab 1: Grades & Info */}
      {editorTab === 'grades' && (
        <form onSubmit={handleSaveInfo} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Student Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setIsDirty(true)
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Section
              </label>
              <select
                value={section}
                onChange={(e) => {
                  setSection(e.target.value)
                  setIsDirty(true)
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
              >
                {ALLOWED_SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Attendance %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={attendanceRate}
                onChange={(e) => {
                  setAttendanceRate(e.target.value)
                  setIsDirty(true)
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-[#35408e] outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#11162b] dark:text-[#ffd41c]"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Subject Grades
              </h3>
              <span className="text-[11px] text-slate-400">
                Tab through fields, then click Save
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {subjects.map((subj) => (
                <div
                  key={subj.id}
                  className="flex items-center justify-between gap-2 rounded-xl bg-[#f5f6fb] px-3.5 py-2.5 dark:bg-[#11162b]"
                >
                  <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {subj.shortName}
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    aria-label={`${subj.shortName} grade`}
                    value={subj.gradeInput}
                    onChange={(e) => handleGradeInputChange(subj.id, e.target.value)}
                    className="w-16 rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-center text-xs font-bold text-[#35408e] outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#181e38] dark:text-[#ffd41c]"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Monthly Grade Trend
              </h3>
              <span className="text-[11px] text-slate-400">
                Latest month auto-syncs with average
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {gradeHistoryLabels.map((month, idx) => (
                <label
                  key={month}
                  className="rounded-xl bg-[#f5f6fb] p-2 text-center dark:bg-[#11162b]"
                >
                  <span className="block text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                    {month}
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    aria-label={`${month} grade average`}
                    value={gradeHistoryInput[idx] ?? '0'}
                    onChange={(e) => {
                      const val = e.target.value
                      setGradeHistoryInput((prev) => prev.map((v, i) => (i === idx ? val : v)))
                      setIsDirty(true)
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-1 py-1 text-center text-xs font-bold text-[#35408e] outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#181e38] dark:text-[#ffd41c]"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700/70">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isDirty ? 'You have unsaved changes.' : 'All changes saved.'}
            </span>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#35408e] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#262f6d] disabled:opacity-60 dark:bg-[#ffd41c] dark:text-[#232b66]"
            >
              {saving ? 'Saving...' : 'Save Student Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Student Tasks */}
      {editorTab === 'tasks' && (
        <div className="space-y-4">
          <form onSubmit={handleAddTaskSubmit} className="grid grid-cols-1 gap-2 sm:grid-cols-12">
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Assign task to this student..."
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#35408e] sm:col-span-5 dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
            />
            <select
              value={taskSubject}
              onChange={(e) => setTaskSubject(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs outline-none focus:border-[#35408e] sm:col-span-3 dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
            >
              {(studentRecord.subjects || []).map((s) => (
                <option key={s.id} value={s.shortName}>
                  {s.shortName}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              placeholder="Due date"
              className="rounded-xl border border-slate-200 px-2.5 py-2 text-xs outline-none focus:border-[#35408e] sm:col-span-2 dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#35408e] px-3 py-2 text-xs font-bold text-white hover:bg-[#262f6d] sm:col-span-2 dark:bg-[#ffd41c] dark:text-[#232b66]"
            >
              Add Task
            </button>
          </form>

          <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">No tasks yet.</p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[#f5f6fb] px-3.5 py-2.5 dark:bg-[#11162b]"
                >
                  <label className="flex flex-1 cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => onToggleTask(studentRecord.id, task.id)}
                      className="h-4 w-4 rounded accent-[#35408e] dark:accent-[#ffd41c]"
                    />
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          task.completed
                            ? 'text-slate-400 line-through'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {task.subject} • Due {task.dueDate}
                      </p>
                    </div>
                  </label>
                  <button
                    type="button"
                    onClick={() => onDeleteTask(studentRecord.id, task.id)}
                    aria-label="Remove task"
                    className="rounded-lg px-2 py-1 text-xs font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Weekly Study Hours & Recommendations */}
      {editorTab === 'notes' && (
        <div className="space-y-5">
          <form onSubmit={handleSaveHours} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Weekly Study Hours (Total: {totalStudyHours} hrs)
              </h3>
              <span className="text-[11px] text-slate-400">Logged vs Target hours/day</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {studyLabels.map((day, idx) => (
                <div
                  key={day}
                  className="rounded-xl bg-[#f5f6fb] p-2.5 text-center dark:bg-[#11162b]"
                >
                  <p className="text-[11px] font-bold text-[#35408e] dark:text-[#ffd41c]">{day}</p>
                  <label className="mt-1.5 block text-[10px] text-slate-500 dark:text-slate-400">
                    Logged
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="16"
                      value={studyHoursInput[idx] ?? '0'}
                      onChange={(e) => {
                        const val = e.target.value
                        setStudyHoursInput((prev) => prev.map((v, i) => (i === idx ? val : v)))
                      }}
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-1 py-1 text-center text-xs font-bold text-[#35408e] outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#181e38] dark:text-[#ffd41c]"
                    />
                  </label>
                  <label className="mt-1.5 block text-[10px] text-slate-500 dark:text-slate-400">
                    Target
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="16"
                      value={targetHoursInput[idx] ?? '0'}
                      onChange={(e) => {
                        const val = e.target.value
                        setTargetHoursInput((prev) => prev.map((v, i) => (i === idx ? val : v)))
                      }}
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-1 py-1 text-center text-[11px] text-slate-700 outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#181e38] dark:text-slate-300"
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingHours}
                className="rounded-xl bg-[#35408e] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#262f6d] disabled:opacity-60 dark:bg-[#ffd41c] dark:text-[#232b66]"
              >
                {savingHours ? 'Saving...' : 'Save Study Hours'}
              </button>
            </div>
          </form>

          <div className="space-y-2.5 border-t border-slate-100 pt-4 dark:border-slate-700/70">
            <h3 className="text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              Personalized Recommendations
            </h3>
            <form onSubmit={handleAddRecSubmit} className="flex gap-2">
              <input
                type="text"
                value={newRec}
                onChange={(e) => setNewRec(e.target.value)}
                placeholder="e.g. Review Finite Mathematics lessons."
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#ffd41c] px-4 py-2 text-xs font-bold text-[#232b66] hover:brightness-95"
              >
                Add Note
              </button>
            </form>

            <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between gap-2 rounded-xl bg-[#eef0fb]/70 px-3 py-2 text-xs text-slate-800 dark:bg-[#11162b] dark:text-slate-200"
                >
                  <span>{rec.text}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteRecommendation(studentRecord.id, rec.id)}
                    aria-label="Remove recommendation"
                    className="rounded px-1.5 py-0.5 font-bold text-slate-400 hover:text-rose-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
