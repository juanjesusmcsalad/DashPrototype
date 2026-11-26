import { useEffect, useState } from 'react'
import { isFirebaseConfigured } from '../firebase'
import { ALLOWED_SECTIONS, subscribeToAllUserAccounts } from '../services/authService'
import { subscribeToAllStudents, updateStudentFields } from '../services/studentService'
import { StudentComparisonBarChart, SubjectBarChart } from './Charts'
import Sidebar from './Sidebar'

const ADMIN_NAV_ITEMS = [
  { id: 'overview', label: 'Admin Overview', icon: 'grid' },
  { id: 'students', label: 'Manage Students', icon: 'users' },
  { id: 'accounts', label: 'User Credentials', icon: 'key' },
  { id: 'analytics', label: 'Section Analytics', icon: 'chart' },
  { id: 'announcements', label: 'Announcements', icon: 'megaphone' },
  { id: 'admin-profile', label: 'Admin Profile', icon: 'user' },
]

function computeAverage(subjects = []) {
  if (subjects.length === 0) return 0
  const total = subjects.reduce((sum, s) => sum + Number(s.grade || 0), 0)
  return Number((total / subjects.length).toFixed(2))
}

export default function AdminDashboardView({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [students, setStudents] = useState([])
  const [accounts, setAccounts] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [sectionFilter, setSectionFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [syncStatus, setSyncStatus] = useState({ mode: 'demo', error: null })
  const [visiblePasswords, setVisiblePasswords] = useState({})
  const [copiedId, setCopiedId] = useState('')
  const [newRec, setNewRec] = useState('')
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementBody, setAnnouncementBody] = useState('')
  const [announcementTarget, setAnnouncementTarget] = useState('ALL')
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    const unsubStudents = subscribeToAllStudents((list) => {
      setStudents(list)
      setSelectedId((prev) => (prev && list.some((s) => s.id === prev) ? prev : list[0]?.id || ''))
    }, setSyncStatus)

    const unsubAccounts = subscribeToAllUserAccounts(setAccounts)
    return () => {
      unsubStudents()
      unsubAccounts()
    }
  }, [])

  const query = search.trim().toLowerCase()

  const filteredStudents = students.filter((entry) => {
    const sec = entry.student?.section || '12SHS2510'
    const matchesSection = sectionFilter === 'ALL' || sec === sectionFilter
    const matchesQuery =
      !query ||
      entry.student?.name?.toLowerCase().includes(query) ||
      entry.student?.email?.toLowerCase().includes(query) ||
      sec.toLowerCase().includes(query)
    return matchesSection && matchesQuery
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
    students.find((s) => s.id === selectedId) ||
    filteredStudents[0] ||
    students[0]

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

  const handleGradeChange = async (subjectId, nextGrade) => {
    if (!selectedStudent) return
    const safeGrade = Math.min(100, Math.max(60, Number.isNaN(nextGrade) ? 60 : nextGrade))
    const updatedSubjects = selectedStudent.subjects.map((subj) =>
      subj.id === subjectId ? { ...subj, grade: safeGrade } : subj
    )
    await updateStudentFields(selectedStudent.id, { subjects: updatedSubjects })
    setSaveMessage(`Updated grade for ${selectedStudent.student.name}.`)
  }

  const handleAttendanceChange = async (nextRate) => {
    if (!selectedStudent) return
    const safeRate = Math.min(100, Math.max(0, Number.isNaN(nextRate) ? 0 : nextRate))
    await updateStudentFields(selectedStudent.id, {
      student: { ...selectedStudent.student, attendanceRate: safeRate },
    })
    setSaveMessage(`Updated attendance for ${selectedStudent.student.name}.`)
  }

  const handleAddRecommendation = async (e) => {
    e.preventDefault()
    if (!selectedStudent || !newRec.trim()) return
    const updatedRecs = [
      {
        id: `rec-${Date.now()}`,
        text: newRec.trim(),
        category: 'Admin Note',
        priority: 'High',
      },
      ...(selectedStudent.recommendations || []),
    ]
    await updateStudentFields(selectedStudent.id, { recommendations: updatedRecs })
    setNewRec('')
    setSaveMessage(`Added recommendation for ${selectedStudent.student.name}.`)
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
      author: currentUser.name || 'CT Senior High Admin',
      body: announcementBody.trim(),
      tag: announcementTarget === 'ALL' ? 'All Sections' : announcementTarget,
    }

    const targets =
      announcementTarget === 'ALL'
        ? students
        : students.filter((s) => (s.student?.section || '12SHS2510') === announcementTarget)

    await Promise.all(
      targets.map((entry) =>
        updateStudentFields(entry.id, {
          announcements: [newAnn, ...(entry.announcements || [])],
        })
      )
    )

    setAnnouncementTitle('')
    setAnnouncementBody('')
    setSaveMessage(
      announcementTarget === 'ALL'
        ? 'Announcement published to all students!'
        : `Announcement published to section ${announcementTarget}!`
    )
  }

  const togglePasswordVisibility = (uid) => {
    setVisiblePasswords((prev) => ({ ...prev, [uid]: !prev[uid] }))
  }

  const copyCredentials = async (acc) => {
    const text = `Email: ${acc.email} | Password: ${acc.password || acc.passwordNote || '(Managed by Firebase Auth)'}`
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(acc.uid)
      setTimeout(() => setCopiedId(''), 1800)
    } catch {
      // Ignore clipboard failures in restricted environments.
    }
  }

  const renderSectionFilterPills = () => (
    <div className="flex flex-wrap gap-1.5 rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-100">
      {['ALL', ...ALLOWED_SECTIONS].map((sec) => (
        <button
          key={sec}
          type="button"
          onClick={() => setSectionFilter(sec)}
          className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${
            sectionFilter === sec
              ? 'bg-[#35408e] text-white'
              : 'text-slate-600 hover:bg-[#eef0fb] hover:text-[#35408e]'
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
                <h1 className="text-xl font-bold text-slate-900">Manage Students</h1>
                <p className="text-xs text-slate-500">
                  Edit subject grades, attendance, and personalized recommendations by section.
                </p>
              </div>
              {renderSectionFilterPills()}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-5">
                <h2 className="mb-3 text-sm font-bold text-slate-900">
                  Students ({filteredStudents.length})
                </h2>
                <div className="space-y-2">
                  {filteredStudents.map((entry) => {
                    const isSelected = selectedStudent?.id === entry.id
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => setSelectedId(entry.id)}
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                          isSelected
                            ? 'bg-[#35408e] text-white shadow-sm'
                            : 'bg-[#f5f6fb] text-slate-800 hover:bg-[#eef0fb]'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold">{entry.student?.name}</p>
                          <p
                            className={`text-[11px] ${
                              isSelected ? 'text-white/80' : 'text-slate-500'
                            }`}
                          >
                            {entry.student?.section || '12SHS2510'} • {entry.student?.email}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            isSelected
                              ? 'bg-[#ffd41c] text-[#232b66]'
                              : 'bg-white text-[#35408e]'
                          }`}
                        >
                          {computeAverage(entry.subjects)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-7">
                {selectedStudent ? (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900">
                            {selectedStudent.student?.name}
                          </h2>
                          <span className="rounded-full bg-[#ffd41c]/35 px-2.5 py-0.5 text-[11px] font-bold text-[#35408e]">
                            {selectedStudent.student?.section || '12SHS2510'}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {selectedStudent.student?.email} • {selectedStudent.student?.studentNumber}
                        </p>
                      </div>

                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        Attendance %:
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={selectedStudent.student?.attendanceRate ?? 96}
                          onChange={(e) => handleAttendanceChange(Number(e.target.value))}
                          className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-center font-bold text-[#35408e] outline-none focus:border-[#35408e]"
                        />
                      </label>
                    </div>

                    <div>
                      <h3 className="mb-2.5 text-xs font-bold tracking-wide text-slate-500 uppercase">
                        Edit Subject Grades
                      </h3>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {(selectedStudent.subjects || []).map((subj) => (
                          <div
                            key={subj.id}
                            className="flex items-center justify-between rounded-xl bg-[#f5f6fb] px-3.5 py-2.5"
                          >
                            <span className="text-xs font-semibold text-slate-800">
                              {subj.shortName}
                            </span>
                            <input
                              type="number"
                              min="60"
                              max="100"
                              value={subj.grade}
                              onChange={(e) => handleGradeChange(subj.id, Number(e.target.value))}
                              className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-xs font-bold text-[#35408e] outline-none focus:border-[#35408e]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <form
                      onSubmit={handleAddRecommendation}
                      className="space-y-2 border-t border-slate-100 pt-4"
                    >
                      <h3 className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                        Add Personalized Recommendation
                      </h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newRec}
                          onChange={(e) => setNewRec(e.target.value)}
                          placeholder="e.g. Submit Chapter 4 draft by Friday."
                          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#35408e]"
                        />
                        <button
                          type="submit"
                          className="rounded-xl bg-[#ffd41c] px-4 py-2 text-xs font-bold text-[#232b66] hover:brightness-95"
                        >
                          Add Note
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No students match the selected filter.</p>
                )}
              </section>
            </div>
          </div>
        )

      case 'accounts':
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900">User Credentials</h1>
                <p className="text-xs text-slate-500">
                  View registered emails, sections, roles, and passwords across all accounts.
                </p>
              </div>
              {renderSectionFilterPills()}
            </div>

            {isFirebaseConfigured && (
              <div className="rounded-2xl border border-[#ffd41c] bg-[#fff9dc] px-4 py-3 text-xs text-[#35408e]">
                <strong>Note:</strong> When connected to Firebase Auth, Firebase securely hashes
                passwords on Google servers, so only accounts signed up via this portal store a
                reference note in Firestore.
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
              <table className="w-full min-w-[680px] text-left text-xs">
                <thead className="border-b border-slate-100 bg-[#f5f6fb] text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                  <tr>
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Section</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Password</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAccounts.map((acc) => {
                    const rawPassword = acc.password || acc.passwordNote || ''
                    const isShown = Boolean(visiblePasswords[acc.uid])
                    return (
                      <tr key={acc.uid} className="hover:bg-[#f5f6fb]/60">
                        <td className="px-5 py-3.5 font-bold text-slate-900">{acc.name}</td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-full bg-[#eef0fb] px-2.5 py-0.5 font-bold text-[#35408e]">
                            {acc.section || '12SHS2510'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 font-bold capitalize ${
                              acc.role === 'admin'
                                ? 'bg-[#ffd41c] text-[#232b66]'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {acc.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-700">{acc.email}</td>
                        <td className="px-5 py-3.5 font-mono text-slate-800">
                          {rawPassword ? (
                            isShown ? rawPassword : '••••••••'
                          ) : (
                            <span className="font-sans text-slate-400">Managed by Firebase</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-2">
                            {rawPassword && (
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(acc.uid)}
                                className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-[#35408e] hover:text-[#35408e]"
                              >
                                {isShown ? 'Hide' : 'Show'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => copyCredentials(acc)}
                              className="rounded-lg bg-[#35408e] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#262f6d]"
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
              <h1 className="text-xl font-bold text-slate-900">Section Analytics</h1>
              <p className="text-xs text-slate-500">
                Compare performance across sections 12SHS2510 and 12SHS2509.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {sectionStats.map((stat) => (
                <div
                  key={stat.section}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#35408e] px-3 py-1 text-xs font-bold text-white">
                      {stat.section}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {stat.count} student{stat.count === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Grade Average</p>
                      <p className="text-2xl font-bold text-slate-900">{stat.avg}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Attendance</p>
                      <p className="text-2xl font-bold text-[#35408e]">{stat.attendance}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-bold text-slate-900">
                  All Students: Grade vs Attendance
                </h2>
                <StudentComparisonBarChart
                  labels={students.map((s) => s.student?.name || s.id)}
                  averages={students.map((s) => computeAverage(s.subjects))}
                  attendanceRates={students.map((s) => s.student?.attendanceRate || 0)}
                />
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-bold text-slate-900">
                  Selected Student Subjects ({selectedStudent?.student?.name || '—'})
                </h2>
                <SubjectBarChart subjects={selectedStudent?.subjects || []} />
              </div>
            </div>
          </div>
        )

      case 'announcements':
        return (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-5">
              <h1 className="text-lg font-bold text-slate-900">Publish Announcement</h1>
              <p className="mt-1 text-xs text-slate-500">
                Send updates to all students or a specific section.
              </p>

              <form onSubmit={handleBroadcastAnnouncement} className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Target Section
                  </label>
                  <select
                    value={announcementTarget}
                    onChange={(e) => setAnnouncementTarget(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-[#35408e]"
                  >
                    <option value="ALL">All Sections (12SHS2510 & 12SHS2509)</option>
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
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#35408e]"
                />
                <textarea
                  rows={4}
                  required
                  value={announcementBody}
                  onChange={(e) => setAnnouncementBody(e.target.value)}
                  placeholder="Write a notice for students..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-[#35408e]"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#35408e] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#262f6d]"
                >
                  Publish Announcement
                </button>
              </form>
            </section>

            <section className="space-y-3 lg:col-span-7">
              <h2 className="text-lg font-bold text-slate-900">Recent Notices</h2>
              {(selectedStudent?.announcements || []).map((ann) => (
                <article
                  key={ann.id}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#ffd41c]/35 px-3 py-0.5 text-xs font-bold text-[#35408e]">
                      {ann.tag}
                    </span>
                    <span className="text-xs text-slate-400">{ann.date}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-slate-900">{ann.title}</h3>
                  <p className="mt-1 text-xs text-slate-600">{ann.body}</p>
                  <p className="mt-2 text-[11px] text-slate-400">Posted by {ann.author}</p>
                </article>
              ))}
            </section>
          </div>
        )

      case 'admin-profile':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Administrator Profile</h1>
              <p className="text-xs text-slate-500">Account details and portal sync status.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">Administrator Name</p>
                <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-sm font-semibold text-slate-800">{currentUser.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Role</p>
                <p className="text-sm font-bold text-[#35408e] uppercase">{currentUser.role}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Backend Mode</p>
                <p className="text-sm font-semibold text-slate-800">
                  {syncStatus.mode === 'firestore' ? 'Firebase Firestore Live' : 'Local Demo Mode'}
                </p>
              </div>
            </div>
          </div>
        )

      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#424fa6] via-[#35408e] to-[#242c66] px-6 py-6 text-white shadow-lg shadow-[#35408e]/20 sm:px-8">
              <div className="pointer-events-none absolute -top-12 right-24 h-40 w-40 rounded-full bg-[#ffd41c]/15 blur-2xl" />
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="inline-block rounded-full bg-[#ffd41c] px-3 py-0.5 text-[11px] font-bold text-[#232b66] uppercase">
                    Administrator Portal
                  </span>
                  <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
                    Welcome back, {currentUser.name}!
                  </h1>
                  <p className="mt-1 text-xs text-white/85 sm:text-sm">
                    Manage sections 12SHS2510 & 12SHS2509, student records, and credentials.
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
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-xs text-slate-500">Registered Students</p>
                <p className="mt-1 text-2xl font-bold text-[#35408e]">{students.length}</p>
              </div>
              <div className="rounded-2xl border-2 border-[#35408e] bg-white p-5 shadow-sm">
                <p className="text-xs text-slate-500">Overall Grade Average</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{overallAvg}</p>
              </div>
              <div className="rounded-2xl border border-[#ffd41c] bg-[#fff9dc] p-5 shadow-sm">
                <p className="text-xs text-[#35408e]">Average Attendance</p>
                <p className="mt-1 text-2xl font-bold text-[#35408e]">{avgAttendance}%</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-xs text-slate-500">Total Accounts</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{accounts.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-8">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">
                    Student Grades vs Attendance
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('analytics')}
                    className="text-xs font-semibold text-[#35408e] hover:text-[#242c66]"
                  >
                    Section analytics
                  </button>
                </div>
                <StudentComparisonBarChart
                  labels={students.map((s) => s.student?.name || s.id)}
                  averages={students.map((s) => computeAverage(s.subjects))}
                  attendanceRates={students.map((s) => s.student?.attendanceRate || 0)}
                />
              </section>

              <section className="space-y-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-4">
                <h2 className="text-sm font-bold text-slate-900">Sections Summary</h2>
                {sectionStats.map((stat) => (
                  <div key={stat.section} className="rounded-xl bg-[#f5f6fb] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#35408e]">{stat.section}</span>
                      <span className="rounded-full bg-[#ffd41c] px-2.5 py-0.5 text-[11px] font-bold text-[#232b66]">
                        {stat.count} students
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">
                      Avg Grade: <strong className="text-slate-900">{stat.avg}</strong> • Attendance:{' '}
                      <strong className="text-slate-900">{stat.attendance}%</strong>
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
    <div className="min-h-screen bg-[#f5f6fb] p-3 sm:p-5 lg:h-screen lg:overflow-hidden">
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
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200/80 lg:hidden"
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
                  className="w-full rounded-full bg-white py-2.5 pr-4 pl-10 text-sm text-slate-700 placeholder-slate-400 shadow-[0_6px_20px_rgba(53,64,142,0.08)] ring-1 ring-slate-100 transition outline-none focus:ring-2 focus:ring-[#35408e]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline-flex ${
                  syncStatus.mode === 'firestore'
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                    : 'bg-[#ffd41c]/20 text-[#35408e] ring-1 ring-[#ffd41c]'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    syncStatus.mode === 'firestore' ? 'bg-emerald-500' : 'bg-[#35408e]'
                  }`}
                />
                {syncStatus.mode === 'firestore' ? 'Firestore Live' : 'Demo Mode'}
              </span>

              <button
                type="button"
                onClick={() => setActiveTab('admin-profile')}
                className="flex items-center gap-2.5 rounded-full py-1 pr-2 pl-1 text-left transition hover:bg-white/70"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#35408e] text-xs font-bold text-[#ffd41c] shadow-sm ring-2 ring-[#ffd41c]">
                  AD
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-bold text-slate-900 sm:text-sm">{currentUser.name}</p>
                  <p className="text-[10px] font-semibold tracking-wide text-[#35408e] uppercase">
                    Administrator
                  </p>
                </div>
              </button>
            </div>
          </header>

          {saveMessage && (
            <div className="flex items-center justify-between rounded-2xl border border-[#35408e]/20 bg-[#eef0fb] px-4 py-2.5 text-xs font-semibold text-[#35408e]">
              <span>{saveMessage}</span>
              <button
                type="button"
                onClick={() => setSaveMessage('')}
                className="text-slate-500 hover:text-slate-800"
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
