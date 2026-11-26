import { useEffect, useState } from 'react'
import {
  subscribeToAllStudents,
  updateStudentFields,
} from '../services/studentService'
import { StudentComparisonBarChart } from './Charts'

function computeAverage(subjects = []) {
  if (subjects.length === 0) return 0
  const total = subjects.reduce((sum, s) => sum + Number(s.grade || 0), 0)
  return Number((total / subjects.length).toFixed(2))
}

export default function AdminDashboardView({ currentUser, onLogout }) {
  const [students, setStudents] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [search, setSearch] = useState('')
  const [syncStatus, setSyncStatus] = useState({ mode: 'demo', error: null })
  const [newRec, setNewRec] = useState('')
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementBody, setAnnouncementBody] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    const unsubscribe = subscribeToAllStudents((list) => {
      setStudents(list)
      setSelectedId((prev) => (prev && list.some((s) => s.id === prev) ? prev : list[0]?.id || ''))
    }, setSyncStatus)
    return () => unsubscribe()
  }, [])

  const filteredStudents = students.filter((entry) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      entry.student?.name?.toLowerCase().includes(q) ||
      entry.student?.email?.toLowerCase().includes(q) ||
      entry.student?.strand?.toLowerCase().includes(q)
    )
  })

  const selectedStudent = students.find((s) => s.id === selectedId) || students[0]

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
      tag: 'Admin Notice',
    }
    await Promise.all(
      students.map((entry) =>
        updateStudentFields(entry.id, {
          announcements: [newAnn, ...(entry.announcements || [])],
        })
      )
    )
    setAnnouncementTitle('')
    setAnnouncementBody('')
    setSaveMessage('Announcement published to all student dashboards!')
  }

  return (
    <div className="min-h-screen bg-[#f5f6fb] p-4 sm:p-6">
      <div className="mx-auto max-w-[1340px] space-y-6">
        {/* Admin Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#424fa6] via-[#35408e] to-[#242c66] px-6 py-5 text-white shadow-lg shadow-[#35408e]/20">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#242c66]/80 ring-1 ring-[#ffd41c]/50">
              <img
                src="/models/graduation-cap.png"
                alt="CT Senior High"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <span className="inline-block rounded-full bg-[#ffd41c] px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-[#232b66] uppercase">
                Administrator Portal
              </span>
              <h1 className="mt-1 text-lg font-bold sm:text-xl">
                CT Senior High — Admin Dashboard
              </h1>
              <p className="text-xs text-white/75">
                Signed in as {currentUser.name} ({currentUser.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
              {syncStatus.mode === 'firestore' ? 'Firestore Live' : 'Demo Mode'}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full bg-[#ffd41c] px-5 py-2 text-xs font-bold text-[#232b66] shadow-sm transition hover:brightness-95"
            >
              Logout
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

        {/* Overview KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">Registered Students</p>
            <p className="mt-1 text-2xl font-bold text-[#35408e]">{students.length}</p>
          </div>
          <div className="rounded-2xl border-2 border-[#35408e] bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">Overall Grade Average</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{overallAvg}</p>
          </div>
          <div className="rounded-2xl border border-[#ffd41c] bg-[#fff9dc] p-5 shadow-sm">
            <p className="text-xs text-[#35408e]">Average Attendance Rate</p>
            <p className="mt-1 text-2xl font-bold text-[#35408e]">{avgAttendance}%</p>
          </div>
        </div>

        {/* Chart + Broadcast Announcement */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-7">
            <h2 className="mb-3 text-sm font-bold text-slate-900">
              Student Grades vs Attendance Comparison
            </h2>
            <StudentComparisonBarChart
              labels={students.map((s) => s.student?.name || s.id)}
              averages={students.map((s) => computeAverage(s.subjects))}
              attendanceRates={students.map((s) => s.student?.attendanceRate || 0)}
            />
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-5">
            <h2 className="mb-3 text-sm font-bold text-slate-900">Post School Announcement</h2>
            <form onSubmit={handleBroadcastAnnouncement} className="space-y-3">
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
                placeholder="Write a notice for all students..."
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
        </div>

        {/* Student Directory & Editor */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-900">Students Directory</h2>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter students..."
                className="w-44 rounded-full border border-slate-200 px-3 py-1 text-xs outline-none focus:border-[#35408e]"
              />
            </div>

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
                          isSelected ? 'text-white/75' : 'text-slate-500'
                        }`}
                      >
                        {entry.student?.strand}
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
                    <h2 className="text-base font-bold text-slate-900">
                      {selectedStudent.student?.name}
                    </h2>
                    <p className="text-xs text-slate-500">
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

                <form onSubmit={handleAddRecommendation} className="space-y-2 border-t border-slate-100 pt-4">
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
              <p className="text-sm text-slate-500">Select a student to inspect or edit records.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
