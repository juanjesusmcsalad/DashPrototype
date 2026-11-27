import { useEffect, useState } from 'react'
import { ALLOWED_SUBJECTS } from '../data/defaultStudentData'
import { isFirebaseConfigured } from '../firebase'
import {
  ALLOWED_SECTIONS,
  sendPasswordResetForEmail,
  subscribeToAllUserAccounts,
  updateUserMetadata,
} from '../services/authService'
import {
  readSchoolConfig,
  saveSchoolConfig,
  subscribeToAllStudents,
  subscribeToSchoolConfig,
  updateStudentFields,
} from '../services/studentService'
import { formatTaskDueDate } from '../utils/academicHelpers'
import AdminStudentEditor from './AdminStudentEditor'
import { SubjectBarChart } from './Charts'
import Sidebar from './Sidebar'
import ThemeToggle from './ThemeToggle'

const ADMIN_NAV_ITEMS = [
  { id: 'overview', label: 'Admin Overview', icon: 'grid' },
  { id: 'students', label: 'Manage Students', icon: 'users' },
  { id: 'schedule', label: 'Class Schedule', icon: 'calendar' },
  { id: 'accounts', label: 'User Credentials', icon: 'key' },
  { id: 'analytics', label: 'Section Analytics', icon: 'chart' },
  { id: 'announcements', label: 'Announcements', icon: 'megaphone' },
  { id: 'admin-profile', label: 'Admin Profile', icon: 'user' },
]

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const CARD = 'rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-700/70 dark:bg-[#181e38]'

function computeAverage(subjects = []) {
  if (subjects.length === 0) return 0
  const total = subjects.reduce((sum, s) => sum + Number(s.grade || 0), 0)
  return Number((total / subjects.length).toFixed(2))
}

export default function AdminDashboardView({ currentUser, onLogout, darkMode, onToggleDarkMode }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [students, setStudents] = useState([])
  const [accounts, setAccounts] = useState([])
  const [schoolConfig, setSchoolConfig] = useState(() => readSchoolConfig())
  const [selectedId, setSelectedId] = useState('')
  const [sectionFilter, setSectionFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('name')
  const [search, setSearch] = useState('')
  const [syncStatus, setSyncStatus] = useState({ mode: 'demo', error: null })
  const [visiblePasswords, setVisiblePasswords] = useState({})
  const [copiedId, setCopiedId] = useState('')
  const [bulkTaskTitle, setBulkTaskTitle] = useState('')
  const [bulkTaskSubject, setBulkTaskSubject] = useState(ALLOWED_SUBJECTS[1].shortName)
  const [bulkTaskDueDate, setBulkTaskDueDate] = useState('')
  const [bulkTaskTarget, setBulkTaskTarget] = useState('ALL')
  const [schedSection, setSchedSection] = useState(ALLOWED_SECTIONS[0])
  const [schedDay, setSchedDay] = useState('Monday')
  const [schedSubject, setSchedSubject] = useState(ALLOWED_SUBJECTS[0].name)
  const [schedTime, setSchedTime] = useState('08:00 AM - 09:30 AM')
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementBody, setAnnouncementBody] = useState('')
  const [announcementTarget, setAnnouncementTarget] = useState('ALL')
  const [sharedNoteText, setSharedNoteText] = useState('')
  const [sharedNoteTarget, setSharedNoteTarget] = useState('ALL')
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    const unsubStudents = subscribeToAllStudents((list) => {
      setStudents(list)
      setSelectedId((prev) => (prev && list.some((s) => s.id === prev) ? prev : list[0]?.id || ''))
    }, setSyncStatus)

    const unsubAccounts = subscribeToAllUserAccounts(setAccounts)
    const unsubSchool = subscribeToSchoolConfig(setSchoolConfig)
    return () => {
      unsubStudents()
      unsubAccounts()
      unsubSchool()
    }
  }, [])

  const query = search.trim().toLowerCase()

  const filteredStudents = students
    .filter((entry) => {
      const sec = entry.student?.section || '12SHS2510'
      const matchesSection = sectionFilter === 'ALL' || sec === sectionFilter
      const matchesQuery =
        !query ||
        entry.student?.name?.toLowerCase().includes(query) ||
        entry.student?.email?.toLowerCase().includes(query) ||
        sec.toLowerCase().includes(query)
      return matchesSection && matchesQuery
    })
    .sort((a, b) => {
      if (sortBy === 'grade-asc') return computeAverage(a.subjects) - computeAverage(b.subjects)
      if (sortBy === 'grade-desc') return computeAverage(b.subjects) - computeAverage(a.subjects)
      if (sortBy === 'attendance-asc') {
        return Number(a.student?.attendanceRate || 0) - Number(b.student?.attendanceRate || 0)
      }
      return (a.student?.name || '').localeCompare(b.student?.name || '')
    })

  const filteredAccounts = accounts.filter((acc) => {
    const sec = acc.section || '12SHS2510'
    const matchesSection = sectionFilter === 'ALL' || sec === sectionFilter
    const matchesQuery =
      !query ||
      acc.name?.toLowerCase().includes(query) ||
      acc.email?.toLowerCase().includes(query) ||
      sec.toLowerCase().includes(query) ||
      acc.role?.toLowerCase().includes(query)
    return matchesSection && matchesQuery
  })

  const selectedStudent =
    filteredStudents.find((s) => s.id === selectedId) ||
    filteredStudents[0] ||
    students.find((s) => s.id === selectedId) ||
    students[0]

  const selectedIndex = filteredStudents.findIndex((s) => s.id === selectedStudent?.id)

  const overallAvg =
    students.length > 0
      ? (
          students.reduce((sum, s) => sum + computeAverage(s.subjects), 0) /
          students.length
        ).toFixed(2)
      : '0.00'

  const avgAttendance =
    students.length > 0
      ? Math.round(
          students.reduce((sum, s) => sum + Number(s.student?.attendanceRate || 0), 0) /
            students.length
        )
      : 0

  const sectionStats = ALLOWED_SECTIONS.map((sec) => {
    const group = students.filter((s) => (s.student?.section || '12SHS2510') === sec)
    const avg =
      group.length > 0
        ? (group.reduce((sum, s) => sum + computeAverage(s.subjects), 0) / group.length).toFixed(2)
        : '0.00'
    const att =
      group.length > 0
        ? Math.round(
            group.reduce((sum, s) => sum + Number(s.student?.attendanceRate || 0), 0) / group.length
          )
        : 0
    return { section: sec, count: group.length, avg, attendance: att, students: group }
  })

  const runAdminAction = async (fn, successMsg) => {
    try {
      await fn()
      if (successMsg) setSaveMessage(successMsg)
    } catch (err) {
      setSaveMessage(`Error: ${err.message || 'Could not save changes.'}`)
    }
  }

  const handleSaveStudentInfo = async (studentId, payload) => {
    await runAdminAction(async () => {
      await updateStudentFields(studentId, payload)
      if (payload.student) {
        try {
          await updateUserMetadata(studentId, {
            name: payload.student.name,
            section: payload.student.section,
          })
        } catch {
          // Ignore if owner-only Firestore rules block cross-user metadata writes.
        }
      }
    }, `Saved updates for ${payload.student?.name || 'student'}.`)
  }

  const handleAddTaskForStudent = async (studentId, newTask) => {
    const target = students.find((s) => s.id === studentId)
    if (!target) return
    const updatedTasks = [newTask, ...(target.tasks || [])]
    await runAdminAction(
      () => updateStudentFields(studentId, { tasks: updatedTasks }),
      `Assigned "${newTask.title}" to ${target.student?.name}.`
    )
  }

  const handleToggleStudentTask = async (studentId, taskId) => {
    const target = students.find((s) => s.id === studentId)
    if (!target) return
    const updatedTasks = (target.tasks || []).map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    )
    await runAdminAction(() => updateStudentFields(studentId, { tasks: updatedTasks }))
  }

  const handleDeleteStudentTask = async (studentId, taskId) => {
    const target = students.find((s) => s.id === studentId)
    if (!target) return
    const updatedTasks = (target.tasks || []).filter((t) => t.id !== taskId)
    await runAdminAction(
      () => updateStudentFields(studentId, { tasks: updatedTasks }),
      `Removed task from ${target.student?.name}.`
    )
  }

  const handleSaveWeeklyEngagement = async (studentId, weeklyEngagement) => {
    const target = students.find((s) => s.id === studentId)
    await runAdminAction(
      () => updateStudentFields(studentId, { weeklyEngagement }),
      `Updated weekly study hours for ${target?.student?.name || 'student'}.`
    )
  }

  const handleAddRecommendation = async (studentId, text) => {
    const target = students.find((s) => s.id === studentId)
    if (!target || !text.trim()) return
    const updatedRecs = [
      {
        id: `rec-${Date.now()}`,
        text: text.trim(),
        category: 'Admin Note',
        priority: 'High',
      },
      ...(target.recommendations || []),
    ]
    await runAdminAction(
      () => updateStudentFields(studentId, { recommendations: updatedRecs }),
      `Added recommendation for ${target.student?.name}.`
    )
  }

  const handleDeleteRecommendation = async (studentId, recId) => {
    const target = students.find((s) => s.id === studentId)
    if (!target) return
    const updatedRecs = (target.recommendations || []).filter((r) => r.id !== recId)
    await runAdminAction(() => updateStudentFields(studentId, { recommendations: updatedRecs }))
  }

  const handleBroadcastNote = async (e) => {
    e.preventDefault()
    if (!sharedNoteText.trim()) return
    const tag = sharedNoteTarget === 'ALL' ? 'All Sections' : sharedNoteTarget
    const newNote = {
      id: `note-${Date.now()}`,
      text: sharedNoteText.trim(),
      category: tag,
      priority: 'Normal',
      tag,
    }
    const nextSchool = {
      ...schoolConfig,
      notes: [newNote, ...(schoolConfig.notes || [])],
    }
    await runAdminAction(
      async () => {
        await saveSchoolConfig(nextSchool)
        setSchoolConfig(nextSchool)
        setSharedNoteText('')
      },
      sharedNoteTarget === 'ALL'
        ? 'Shared note posted for all students (including future sign-ups)!'
        : `Class note posted for section ${sharedNoteTarget}!`
    )
  }

  const handleDeleteSharedNote = async (noteId) => {
    const nextSchool = {
      ...schoolConfig,
      notes: (schoolConfig.notes || []).filter((n) => n.id !== noteId),
    }
    await runAdminAction(async () => {
      await saveSchoolConfig(nextSchool)
      setSchoolConfig(nextSchool)
    }, 'Class note removed.')
  }

  const handleBulkAssignTask = async (e) => {
    e.preventDefault()
    if (!bulkTaskTitle.trim()) return

    const targets =
      bulkTaskTarget === 'ALL'
        ? students
        : students.filter((s) => (s.student?.section || '12SHS2510') === bulkTaskTarget)

    if (targets.length === 0) return

    const baseId = Date.now()
    const titleText = bulkTaskTitle.trim()
    await runAdminAction(async () => {
      await Promise.all(
        targets.map((entry, idx) =>
          updateStudentFields(entry.id, {
            tasks: [
              {
                id: `t-bulk-${baseId}-${idx}`,
                title: titleText,
                subject: bulkTaskSubject,
                dueDate: formatTaskDueDate(bulkTaskDueDate),
                completed: false,
              },
              ...(entry.tasks || []),
            ],
          })
        )
      )
      setBulkTaskTitle('')
      setBulkTaskDueDate('')
    }, `Assigned "${titleText}" to ${targets.length} student${targets.length === 1 ? '' : 's'} (${bulkTaskTarget === 'ALL' ? 'All Sections' : bulkTaskTarget}).`)
  }

  const handleAddScheduleSlot = async (e) => {
    e.preventDefault()
    if (!schedTime.trim()) return

    const newSlot = {
      id: `sch-${Date.now()}`,
      day: schedDay,
      subject: schedSubject,
      time: schedTime.trim(),
    }

    const sectionsToUpdate = schedSection === 'ALL' ? ALLOWED_SECTIONS : [schedSection]
    const nextSchedules = { ...schoolConfig.schedules }
    sectionsToUpdate.forEach((sec) => {
      nextSchedules[sec] = [...(nextSchedules[sec] || []), newSlot]
    })
    const nextSchool = { ...schoolConfig, schedules: nextSchedules }

    const targets =
      schedSection === 'ALL'
        ? students
        : students.filter((s) => (s.student?.section || '12SHS2510') === schedSection)

    await runAdminAction(
      async () => {
        await saveSchoolConfig(nextSchool)
        setSchoolConfig(nextSchool)
        await Promise.all(
          targets.map((entry) =>
            updateStudentFields(entry.id, {
              schedule: nextSchedules[entry.student?.section || '12SHS2510'] || [],
            })
          )
        )
      },
      `Added ${schedSubject} (${schedDay}) to ${
        schedSection === 'ALL' ? 'all sections' : schedSection
      }.`
    )
  }

  const handleRemoveScheduleSlot = async (targetSection, slotId) => {
    const nextSlots = (schoolConfig.schedules[targetSection] || []).filter(
      (item) => item.id !== slotId
    )
    const nextSchool = {
      ...schoolConfig,
      schedules: { ...schoolConfig.schedules, [targetSection]: nextSlots },
    }
    const targets = students.filter(
      (s) => (s.student?.section || '12SHS2510') === targetSection
    )
    await runAdminAction(async () => {
      await saveSchoolConfig(nextSchool)
      setSchoolConfig(nextSchool)
      await Promise.all(
        targets.map((entry) => updateStudentFields(entry.id, { schedule: nextSlots }))
      )
    }, `Removed schedule entry from ${targetSection}.`)
  }

  const handleClearSectionSchedule = async (targetSection) => {
    const nextSchool = {
      ...schoolConfig,
      schedules: { ...schoolConfig.schedules, [targetSection]: [] },
    }
    const targets = students.filter(
      (s) => (s.student?.section || '12SHS2510') === targetSection
    )
    await runAdminAction(async () => {
      await saveSchoolConfig(nextSchool)
      setSchoolConfig(nextSchool)
      await Promise.all(
        targets.map((entry) => updateStudentFields(entry.id, { schedule: [] }))
      )
    }, `Cleared schedule for ${targetSection}.`)
  }

  const handleBroadcastAnnouncement = async (e) => {
    e.preventDefault()
    if (!announcementTitle.trim() || !announcementBody.trim()) return
    const newAnn = {
      id: `ann-${Date.now()}`,
      title: announcementTitle.trim(),
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      author: currentUser.name || 'NU MOA CT Admin',
      body: announcementBody.trim(),
      tag: announcementTarget === 'ALL' ? 'All Sections' : announcementTarget,
    }

    const nextSchool = {
      ...schoolConfig,
      announcements: [newAnn, ...(schoolConfig.announcements || [])],
    }

    const targets =
      announcementTarget === 'ALL'
        ? students
        : students.filter((s) => (s.student?.section || '12SHS2510') === announcementTarget)

    await runAdminAction(async () => {
      await saveSchoolConfig(nextSchool)
      setSchoolConfig(nextSchool)
      await Promise.all(
        targets.map((entry) =>
          updateStudentFields(entry.id, {
            announcements: [newAnn, ...(entry.announcements || [])],
          })
        )
      )
      setAnnouncementTitle('')
      setAnnouncementBody('')
    }, announcementTarget === 'ALL' ? 'Announcement published to all students!' : `Announcement published to section ${announcementTarget}!`)
  }

  const handleDeleteAnnouncement = async (annId) => {
    const nextAnnouncements = (schoolConfig.announcements || []).filter((a) => a.id !== annId)
    const nextSchool = { ...schoolConfig, announcements: nextAnnouncements }
    await runAdminAction(async () => {
      await saveSchoolConfig(nextSchool)
      setSchoolConfig(nextSchool)
      await Promise.all(
        students.map((entry) =>
          updateStudentFields(entry.id, {
            announcements: (entry.announcements || []).filter((a) => a.id !== annId),
          })
        )
      )
    }, 'Announcement removed.')
  }

  const togglePasswordVisibility = (uid) => {
    setVisiblePasswords((prev) => ({ ...prev, [uid]: !prev[uid] }))
  }

  const copyCredentials = async (acc) => {
    const pw = !isFirebaseConfigured && acc.password ? acc.password : '(Protected by Firebase Auth)'
    const text = `Email: ${acc.email} | Password: ${pw}`
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(acc.uid)
      setTimeout(() => setCopiedId(''), 1800)
    } catch {
      // Ignore clipboard failures in restricted environments.
    }
  }

  const handleSendPasswordReset = async (acc) => {
    await runAdminAction(
      () => sendPasswordResetForEmail(acc.email),
      `Password reset email sent to ${acc.email}.`
    )
  }

  const renderSectionFilterPills = () => (
    <div className="flex flex-wrap gap-1.5 rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-100 dark:bg-[#181e38] dark:ring-slate-700">
      {['ALL', ...ALLOWED_SECTIONS].map((sec) => (
        <button
          key={sec}
          type="button"
          onClick={() => setSectionFilter(sec)}
          className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all duration-200 ease-out ${
            sectionFilter === sec
              ? 'bg-gradient-to-r from-[#424fa6] to-[#20275e] text-white shadow-sm dark:from-[#ffd41c] dark:to-[#f2b800] dark:text-[#232b66]'
              : 'text-slate-600 hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-[#eef0fb] hover:to-[#e2e7fb] hover:text-[#35408e] dark:text-slate-300 dark:hover:from-white/10 dark:hover:to-white/5'
          }`}
        >
          {sec === 'ALL' ? 'All Sections' : sec}
        </button>
      ))}
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'students':
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Manage Students</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bulk-assign tasks to whole sections or step through students to edit grades and tasks.
                </p>
              </div>
              {renderSectionFilterPills()}
            </div>

            {/* Bulk Assign Task to Section / All Students */}
            <form
              onSubmit={handleBulkAssignTask}
              className={`${CARD} grid grid-cols-1 gap-2.5 p-4 md:grid-cols-12`}
            >
              <div className="flex items-center text-xs font-bold text-[#35408e] md:col-span-12 dark:text-[#ffd41c]">
                Assign Task to Multiple Students (12SHS2510 / 12SHS2509)
              </div>
              <input
                type="text"
                required
                value={bulkTaskTitle}
                onChange={(e) => setBulkTaskTitle(e.target.value)}
                placeholder="e.g. Submit Chapter 3 Revised Draft"
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#35408e] md:col-span-4 dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
              />
              <select
                value={bulkTaskSubject}
                onChange={(e) => setBulkTaskSubject(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#35408e] md:col-span-2 dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
              >
                {ALLOWED_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.shortName}>
                    {s.shortName}
                  </option>
                ))}
              </select>
              <input
                type="date"
                aria-label="Bulk task due date"
                value={bulkTaskDueDate}
                onChange={(e) => setBulkTaskDueDate(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#35408e] md:col-span-2 dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
              />
              <select
                value={bulkTaskTarget}
                onChange={(e) => setBulkTaskTarget(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-[#35408e] md:col-span-2 dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
              >
                <option value="ALL">All Students ({students.length})</option>
                {ALLOWED_SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec} Only
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-xl bg-[#ffd41c] px-4 py-2 text-xs font-bold text-[#232b66] hover:brightness-95 md:col-span-2"
              >
                Assign Bulk Task
              </button>
            </form>

            {/* Broadcast Class / All-Sections Note */}
            <div className={`${CARD} space-y-3 p-4`}>
              <form onSubmit={handleBroadcastNote} className="grid grid-cols-1 gap-2.5 md:grid-cols-12">
                <div className="flex items-center justify-between text-xs font-bold text-[#35408e] md:col-span-12 dark:text-[#ffd41c]">
                  <span>Post Note to All Students or Specific Section</span>
                  <span className="text-[11px] font-medium text-slate-400">
                    New sign-ups automatically inherit notes matching their section
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={sharedNoteText}
                  onChange={(e) => setSharedNoteText(e.target.value)}
                  placeholder="e.g. Bring scientific calculators for Finite Mathematics tomorrow."
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#35408e] md:col-span-8 dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
                />
                <select
                  value={sharedNoteTarget}
                  onChange={(e) => setSharedNoteTarget(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-[#35408e] md:col-span-2 dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
                >
                  <option value="ALL">All Sections</option>
                  {ALLOWED_SECTIONS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec} Only
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-xl bg-[#35408e] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#262f6d] md:col-span-2 dark:bg-[#ffd41c] dark:text-[#232b66]"
                >
                  Post Note
                </button>
              </form>

              {(schoolConfig.notes || []).length > 0 && (
                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-700/70">
                  {(schoolConfig.notes || []).map((note) => (
                    <div
                      key={note.id}
                      className="flex items-center gap-2 rounded-full bg-[#eef0fb] py-1 pr-2 pl-3 text-xs text-slate-800 dark:bg-[#11162b] dark:text-slate-200"
                    >
                      <span className="rounded-full bg-[#ffd41c]/40 px-2 py-0.5 text-[10px] font-bold text-[#35408e] dark:text-[#ffd41c]">
                        {note.tag || note.category}
                      </span>
                      <span>{note.text}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSharedNote(note.id)}
                        aria-label="Remove shared note"
                        className="rounded-full px-1 font-bold text-slate-400 hover:text-rose-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <section className={`${CARD} p-5 lg:col-span-5`}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Students ({filteredStudents.length})
                  </h2>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort students"
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-200"
                  >
                    <option value="name">Sort: Name (A–Z)</option>
                    <option value="grade-asc">Sort: Lowest Grade</option>
                    <option value="grade-desc">Sort: Highest Grade</option>
                    <option value="attendance-asc">Sort: Lowest Attendance</option>
                  </select>
                </div>

                <div className="max-h-[540px] space-y-2 overflow-y-auto pr-1">
                  {filteredStudents.length === 0 ? (
                    <div className="rounded-xl bg-[#f5f6fb] p-4 text-center text-xs text-slate-500 dark:bg-[#11162b] dark:text-slate-400">
                      <p>No students registered yet. Students appear here once they sign up.</p>
                      {syncStatus.mode !== 'firestore' && students.length === 0 && (
                        <p className="mt-1.5 text-[11px] text-amber-700 dark:text-amber-300">
                          Running in Local Demo Mode: student records are stored only in the browser where they signed up. Connect Firebase &amp; deploy <code>firestore.rules</code> so all admins share live records.
                        </p>
                      )}
                    </div>
                  ) : (
                    filteredStudents.map((entry) => {
                    const isSelected = selectedStudent?.id === entry.id
                    const pendingTasks = (entry.tasks || []).filter((t) => !t.completed).length
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => setSelectedId(entry.id)}
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                          isSelected
                            ? 'bg-[#35408e] text-white shadow-sm'
                            : 'bg-[#f5f6fb] text-slate-800 hover:bg-[#eef0fb] dark:bg-[#11162b] dark:text-slate-200 dark:hover:bg-[#232b52]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="truncate text-sm font-bold">{entry.student?.name}</p>
                          <p
                            className={`truncate text-[11px] ${
                              isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {entry.student?.section || '12SHS2510'} • {entry.student?.attendanceRate ?? 0}% att •{' '}
                            {pendingTasks} pending
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            isSelected
                              ? 'bg-[#ffd41c] text-[#232b66]'
                              : 'bg-white text-[#35408e] dark:bg-[#181e38] dark:text-[#ffd41c]'
                          }`}
                        >
                          {computeAverage(entry.subjects)}
                        </span>
                      </button>
                    )
                  })
                  )}
                </div>
              </section>

              <section className={`${CARD} p-5 lg:col-span-7`}>
                <AdminStudentEditor
                  key={selectedStudent?.id || 'empty'}
                  studentRecord={selectedStudent}
                  onSaveStudentInfo={handleSaveStudentInfo}
                  onAddTask={handleAddTaskForStudent}
                  onToggleTask={handleToggleStudentTask}
                  onDeleteTask={handleDeleteStudentTask}
                  onSaveWeeklyEngagement={handleSaveWeeklyEngagement}
                  onAddRecommendation={handleAddRecommendation}
                  onDeleteRecommendation={handleDeleteRecommendation}
                  onPrevStudent={() => {
                    if (selectedIndex > 0) setSelectedId(filteredStudents[selectedIndex - 1].id)
                  }}
                  onNextStudent={() => {
                    if (selectedIndex >= 0 && selectedIndex < filteredStudents.length - 1) {
                      setSelectedId(filteredStudents[selectedIndex + 1].id)
                    }
                  }}
                  hasPrev={selectedIndex > 0}
                  hasNext={selectedIndex >= 0 && selectedIndex < filteredStudents.length - 1}
                />
              </section>
            </div>
          </div>
        )

      case 'schedule': {
        const previewSection = schedSection === 'ALL' ? ALLOWED_SECTIONS[0] : schedSection
        const currentSlots = schoolConfig.schedules?.[previewSection] || []

        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Configure Class Schedule
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add or remove class timetable slots for sections 12SHS2510 and 12SHS2509.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <form
                onSubmit={handleAddScheduleSlot}
                className={`${CARD} space-y-3 p-5 lg:col-span-5`}
              >
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Add Schedule Slot
                </h2>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Section
                  </label>
                  <select
                    value={schedSection}
                    onChange={(e) => setSchedSection(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
                  >
                    {ALLOWED_SECTIONS.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                    <option value="ALL">Both Sections (12SHS2510 &amp; 12SHS2509)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Subject
                  </label>
                  <select
                    value={schedSubject}
                    onChange={(e) => setSchedSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
                  >
                    {ALLOWED_SUBJECTS.map((subj) => (
                      <option key={subj.id} value={subj.name}>
                        {subj.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Day
                  </label>
                  <select
                    value={schedDay}
                    onChange={(e) => setSchedDay(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Time
                  </label>
                  <input
                    type="text"
                    required
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    placeholder="e.g. 08:00 AM - 09:30 AM"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#35408e] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#262f6d] dark:bg-[#ffd41c] dark:text-[#232b66]"
                >
                  Add to Schedule
                </button>
              </form>

              <section className={`${CARD} p-5 lg:col-span-7`}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      {previewSection} Timetable ({currentSlots.length} slots)
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Switch target section on the left to preview or edit each section.
                    </p>
                  </div>
                  {currentSlots.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleClearSectionSchedule(previewSection)}
                      className="rounded-lg border border-rose-200 px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/50"
                    >
                      Clear {previewSection}
                    </button>
                  )}
                </div>

                {currentSlots.length === 0 ? (
                  <p className="rounded-xl bg-[#f5f6fb] p-6 text-center text-xs text-slate-500 dark:bg-[#11162b] dark:text-slate-400">
                    No schedule slots configured for {previewSection} yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {currentSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-start justify-between gap-2 rounded-xl bg-[#f5f6fb] p-3.5 dark:bg-[#11162b]"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-[#35408e] uppercase dark:text-[#ffd41c]">
                              {slot.day}
                            </span>
                            {slot.room && (
                              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-[#181e38] dark:text-slate-300">
                                {slot.room}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">
                            {slot.subject}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {slot.time}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveScheduleSlot(previewSection, slot.id)}
                          aria-label="Remove slot"
                          className="rounded-lg px-2 py-0.5 text-xs font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )
      }

      case 'accounts':
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">User Credentials</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  View registered emails, sections, roles, and passwords across all accounts.
                </p>
              </div>
              {renderSectionFilterPills()}
            </div>

            {isFirebaseConfigured && (
              <div className="rounded-2xl border border-[#ffd41c] bg-[#fff9dc] px-4 py-3 text-xs text-[#35408e] dark:border-[#ffd41c]/50 dark:bg-[#272318] dark:text-[#ffd41c]">
                <strong>Firebase Security:</strong> Passwords are encrypted and hashed on Google
                servers (never stored in plaintext). Use <strong>Reset Email</strong> if a student
                or admin forgets their password.
              </div>
            )}

            <div className={`${CARD} overflow-x-auto`}>
              <table className="w-full min-w-[680px] text-left text-xs">
                <thead className="border-b border-slate-100 bg-[#f5f6fb] text-[11px] font-bold tracking-wide text-slate-500 uppercase dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Section</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Password</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredAccounts.map((acc) => {
                    const rawPassword = !isFirebaseConfigured ? (acc.password || '') : ''
                    const isShown = Boolean(visiblePasswords[acc.uid])
                    return (
                      <tr key={acc.uid} className="hover:bg-[#f5f6fb]/60 dark:hover:bg-white/5">
                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{acc.name}</td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-full bg-[#eef0fb] px-2.5 py-0.5 font-bold text-[#35408e] dark:bg-[#232b52] dark:text-[#ffd41c]">
                            {acc.section || '12SHS2510'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 font-bold capitalize ${
                              acc.role === 'admin'
                                ? 'bg-[#ffd41c] text-[#232b66]'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {acc.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-700 dark:text-slate-300">{acc.email}</td>
                        <td className="px-5 py-3.5 font-mono text-slate-800 dark:text-slate-200">
                          {rawPassword ? (
                            isShown ? rawPassword : '••••••••'
                          ) : (
                            <span className="font-sans text-emerald-600 dark:text-emerald-400">
                              Protected by Firebase Auth
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-2">
                            {rawPassword && (
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(acc.uid)}
                                className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-[#35408e] hover:text-[#35408e] dark:border-slate-700 dark:text-slate-200 dark:hover:border-[#ffd41c] dark:hover:text-[#ffd41c]"
                              >
                                {isShown ? 'Hide' : 'Show'}
                              </button>
                            )}
                            {isFirebaseConfigured && (
                              <button
                                type="button"
                                onClick={() => handleSendPasswordReset(acc)}
                                className="rounded-lg border border-[#35408e]/30 px-2.5 py-1 text-[11px] font-semibold text-[#35408e] hover:bg-[#eef0fb] dark:border-slate-600 dark:text-[#ffd41c] dark:hover:bg-[#232b52]"
                              >
                                Reset Email
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => copyCredentials(acc)}
                              className="rounded-lg bg-[#35408e] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#262f6d] dark:bg-[#ffd41c] dark:text-[#232b66]"
                            >
                              {copiedId === acc.uid ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Section Analytics</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Section summaries and individual student performance for 12SHS2510 and 12SHS2509.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {sectionStats.map((stat) => (
                <div key={stat.section} className={`${CARD} p-5`}>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#35408e] px-3 py-1 text-xs font-bold text-white">
                      {stat.section}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {stat.count} student{stat.count === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Grade Average</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.avg}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Attendance</p>
                      <p className="text-2xl font-bold text-[#35408e] dark:text-[#ffd41c]">{stat.attendance}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={`${CARD} p-5`}>
              <h2 className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                Selected Student Subjects ({selectedStudent?.student?.name || '—'})
              </h2>
              <SubjectBarChart subjects={selectedStudent?.subjects || []} />
            </div>
          </div>
        )

      case 'announcements': {
        const allAnnouncements = schoolConfig.announcements || []

        return (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className={`${CARD} p-5 lg:col-span-5`}>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">Publish Announcement</h1>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Send updates to all students or a specific section.
              </p>

              <form onSubmit={handleBroadcastAnnouncement} className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Section
                  </label>
                  <select
                    value={announcementTarget}
                    onChange={(e) => setAnnouncementTarget(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
                  >
                    <option value="ALL">All Sections (12SHS2510 &amp; 12SHS2509)</option>
                    {ALLOWED_SECTIONS.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec} Only
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="Announcement title"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
                />
                <textarea
                  rows={4}
                  required
                  value={announcementBody}
                  onChange={(e) => setAnnouncementBody(e.target.value)}
                  placeholder="Write a notice for students..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#35408e] dark:border-slate-700 dark:bg-[#11162b] dark:text-slate-100"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#35408e] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#262f6d] dark:bg-[#ffd41c] dark:text-[#232b66]"
                >
                  Publish Announcement
                </button>
              </form>
            </section>

            <section className="space-y-3 lg:col-span-7">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Notices</h2>
              {allAnnouncements.length === 0 ? (
                <div className={`${CARD} p-6 text-center text-xs text-slate-500 dark:text-slate-400`}>
                  No announcements published yet.
                </div>
              ) : (
                allAnnouncements.map((ann) => (
                  <article key={ann.id} className={`${CARD} p-5`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-[#ffd41c]/35 px-3 py-0.5 text-xs font-bold text-[#35408e] dark:text-[#ffd41c]">
                        {ann.tag}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{ann.date}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          aria-label="Delete announcement"
                          className="rounded px-1.5 py-0.5 text-xs font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{ann.title}</h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{ann.body}</p>
                    <p className="mt-2 text-[11px] text-slate-400">Posted by {ann.author}</p>
                  </article>
                ))
              )}
            </section>
          </div>
        )
      }

      case 'admin-profile':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Administrator Profile</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Account details and portal sync status.</p>
            </div>
            <div className={`${CARD} grid grid-cols-1 gap-4 p-6 sm:grid-cols-2`}>
              <div>
                <p className="text-xs text-slate-400">Administrator Name</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{currentUser.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Role</p>
                <p className="text-sm font-bold text-[#35408e] uppercase dark:text-[#ffd41c]">{currentUser.role}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Backend Mode</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {syncStatus.mode === 'firestore' ? 'Firebase Firestore Live' : 'Local Demo Mode'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#35408e]/25 bg-[#eef0fb]/70 p-5 dark:border-slate-700 dark:bg-[#181e38]">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Administrator Security Checklist
              </h2>
              <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li>
                  1. Deploy <code>firestore.rules</code> in Firebase Console → Firestore Database → Rules so students can never set <code>role: &quot;admin&quot;</code> or edit official grades.
                </li>
                <li>
                  2. Create your real Admin user in Firebase Console → Authentication, then set their document in <code>users/&#123;uid&#125;</code> with <code>role: &quot;admin&quot;</code>.
                </li>
                <li>
                  3. Demo admin credentials are automatically disabled in production builds (<code>vite build</code>).
                </li>
              </ul>
            </div>
          </div>
        )

      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4f5ec4] via-[#35408e] to-[#171d4b] px-6 py-6 text-white shadow-lg shadow-[#1b225c]/25 ring-1 ring-white/10 sm:px-8">
              <div className="pointer-events-none absolute -top-12 right-24 h-40 w-40 rounded-full bg-[#ffd41c]/15 blur-2xl" />
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="inline-block rounded-full bg-[#ffd41c] px-3 py-0.5 text-[11px] font-bold text-[#232b66] uppercase">
                    Trackable Dash • Admin Portal
                  </span>
                  <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
                    Welcome back, {currentUser.name}!
                  </h1>
                  <p className="mt-1 text-xs text-white/85 sm:text-sm">
                    Manage NU MOA CT sections 12SHS2510 &amp; 12SHS2509, student records, and credentials.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('accounts')}
                    className="rounded-full bg-[#ffd41c] px-5 py-2 text-xs font-bold text-[#232b66] shadow-sm hover:brightness-95"
                  >
                    View Credentials
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('students')}
                    className="rounded-full bg-white/15 px-5 py-2 text-xs font-semibold text-white ring-1 ring-white/25 hover:bg-white/20"
                  >
                    Manage Students
                  </button>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className={`${CARD} p-5`}>
                <p className="text-xs text-slate-500 dark:text-slate-400">Registered Students</p>
                <p className="mt-1 text-2xl font-bold text-[#35408e] dark:text-[#ffd41c]">{students.length}</p>
              </div>
              <div className="rounded-2xl border-2 border-[#35408e] bg-white p-5 shadow-sm dark:border-[#ffd41c] dark:bg-[#181e38]">
                <p className="text-xs text-slate-500 dark:text-slate-400">Overall Grade Average</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{overallAvg}</p>
              </div>
              <div className="rounded-2xl border border-[#ffd41c] bg-[#fff9dc] p-5 shadow-sm dark:border-[#ffd41c]/60 dark:bg-[#272318]">
                <p className="text-xs text-[#35408e] dark:text-[#ffd41c]">Average Attendance</p>
                <p className="mt-1 text-2xl font-bold text-[#35408e] dark:text-[#ffd41c]">{avgAttendance}%</p>
              </div>
              <div className={`${CARD} p-5`}>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Accounts</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{accounts.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <section className={`${CARD} p-5 lg:col-span-8`}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Subject Overview {selectedStudent?.student?.name ? `(${selectedStudent.student.name})` : ''}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('students')}
                    className="text-xs font-semibold text-[#35408e] hover:text-[#242c66] dark:text-[#ffd41c]"
                  >
                    Manage students
                  </button>
                </div>
                {selectedStudent ? (
                  <SubjectBarChart subjects={selectedStudent.subjects || []} />
                ) : (
                  <p className="flex h-64 items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                    No students registered yet.
                  </p>
                )}
              </section>

              <section className={`${CARD} space-y-3 p-5 lg:col-span-4`}>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Sections Summary</h2>
                {sectionStats.map((stat) => (
                  <div key={stat.section} className="rounded-xl bg-[#f5f6fb] p-4 dark:bg-[#11162b]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#35408e] dark:text-[#ffd41c]">{stat.section}</span>
                      <span className="rounded-full bg-[#ffd41c] px-2.5 py-0.5 text-[11px] font-bold text-[#232b66]">
                        {stat.count} students
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                      Avg Grade: <strong className="text-slate-900 dark:text-white">{stat.avg}</strong> • Attendance:{' '}
                      <strong className="text-slate-900 dark:text-white">{stat.attendance}%</strong>
                    </p>
                  </div>
                ))}
              </section>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6fb] p-3 transition-colors sm:p-5 lg:h-screen lg:overflow-hidden dark:bg-[#0f1326]">
      <div className="mx-auto flex h-full max-w-[1380px] gap-6">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onLogout={onLogout}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          navItems={ADMIN_NAV_ITEMS}
          badgeText="Admin Portal"
        />

        <main className="flex min-w-0 flex-1 flex-col gap-5 lg:overflow-y-auto lg:pr-1">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200/80 lg:hidden dark:bg-[#181e38] dark:text-slate-200 dark:ring-slate-700"
                aria-label="Open navigation menu"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="relative w-64 sm:w-80">
                <svg
                  className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students or accounts"
                  className="w-full rounded-full bg-white py-2.5 pr-4 pl-10 text-sm text-slate-700 placeholder-slate-400 shadow-[0_6px_20px_rgba(53,64,142,0.08)] ring-1 ring-slate-100 transition outline-none focus:ring-2 focus:ring-[#35408e] dark:bg-[#181e38] dark:text-slate-100 dark:placeholder-slate-400 dark:ring-slate-700 dark:focus:ring-[#ffd41c]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />

              <button
                type="button"
                onClick={() => setActiveTab('admin-profile')}
                className="flex items-center gap-2.5 rounded-full py-1 pr-2 pl-1 text-left transition hover:bg-white/70 dark:hover:bg-white/10"
              >
                <img
                  src="/models/nu-logo.png"
                  alt={currentUser.name}
                  className="h-10 w-10 rounded-full bg-[#242c66] object-contain p-1 shadow-sm ring-2 ring-[#ffd41c]"
                />
                <div className="leading-tight">
                  <p className="text-xs font-bold text-slate-900 sm:text-sm dark:text-slate-100">{currentUser.name}</p>
                  <p className="text-[10px] font-semibold tracking-wide text-[#35408e] uppercase dark:text-[#ffd41c]">
                    Administrator
                  </p>
                </div>
              </button>
            </div>
          </header>

          {syncStatus.error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
              Firestore sync error: {syncStatus.error}. Make sure you have deployed the updated{' '}
              <code>firestore.rules</code> in Firebase Console so administrators can read all student records.
            </div>
          )}

          {saveMessage && (
            <div className="flex items-center justify-between rounded-2xl border border-[#35408e]/20 bg-[#eef0fb] px-4 py-2.5 text-xs font-semibold text-[#35408e] dark:border-slate-700 dark:bg-[#1e2647] dark:text-[#ffd41c]">
              <span>{saveMessage}</span>
              <button
                type="button"
                onClick={() => setSaveMessage('')}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-300"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="pb-4">{renderTabContent()}</div>
        </main>
      </div>
    </div>
  )
}
