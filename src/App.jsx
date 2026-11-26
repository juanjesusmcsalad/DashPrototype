import { useEffect, useState } from 'react'
import DashboardView from './components/DashboardView'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import {
  AcademicProgressView,
  AnnouncementsView,
  EngagementAnalyticsView,
  PerformanceInsightsView,
  ProfileView,
  ScheduleView,
  TasksView,
} from './components/SubViews'
import { DEFAULT_STUDENT_DATA } from './data/defaultStudentData'
import {
  seedDemoStudentData,
  subscribeToStudentData,
  updateStudentFields,
} from './services/studentService'

export default function App() {
  const [data, setData] = useState(DEFAULT_STUDENT_DATA)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState({ mode: 'demo', error: null })
  const [seedingMessage, setSeedingMessage] = useState('')
  const [loggedOut, setLoggedOut] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToStudentData(setData, setSyncStatus)
    return () => unsubscribe()
  }, [])

  const handleToggleTask = async (taskId) => {
    const updatedTasks = data.tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
    setData((prev) => ({ ...prev, tasks: updatedTasks }))
    try {
      await updateStudentFields({ tasks: updatedTasks })
    } catch (err) {
      setSyncStatus((prev) => ({ ...prev, error: err.message }))
    }
  }

  const handleAddTask = async (newTask) => {
    const updatedTasks = [newTask, ...data.tasks]
    setData((prev) => ({ ...prev, tasks: updatedTasks }))
    try {
      await updateStudentFields({ tasks: updatedTasks })
    } catch (err) {
      setSyncStatus((prev) => ({ ...prev, error: err.message }))
    }
  }

  const handleUpdateGrade = async (subjectId, newGrade) => {
    const safeGrade = Math.min(100, Math.max(60, Number.isNaN(newGrade) ? 60 : newGrade))
    const updatedSubjects = data.subjects.map((subj) =>
      subj.id === subjectId ? { ...subj, grade: safeGrade } : subj
    )
    setData((prev) => ({ ...prev, subjects: updatedSubjects }))
    try {
      await updateStudentFields({ subjects: updatedSubjects })
    } catch (err) {
      setSyncStatus((prev) => ({ ...prev, error: err.message }))
    }
  }

  const handleSeedFirestore = async () => {
    setSeedingMessage('Syncing...')
    try {
      await seedDemoStudentData()
      setSeedingMessage('Demo data saved to Firestore!')
    } catch (err) {
      setSeedingMessage(err.message)
    }
  }

  if (loggedOut) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f5fb] p-6">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-purple-100">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a67bf5] to-[#7c3aed] text-white">
            <svg className="h-7 w-7" viewBox="0 0 64 64" fill="currentColor">
              <path d="M32 10L6 22l26 12 21-9.7V36h4V22L32 10z" />
              <path d="M16 30.5V40c0 4.4 7.2 8 16 8s16-3.6 16-8v-9.5L32 37.9 16 30.5z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-slate-900">Signed Out</h1>
          <p className="mt-1 text-xs text-slate-500">
            Demo session ended for {data.student.name} ({data.student.school}).
          </p>
          <button
            type="button"
            onClick={() => setLoggedOut(false)}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-[#9b6bf2] to-[#7c3aed] py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          >
            Sign Back In
          </button>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'academic-progress':
        return (
          <AcademicProgressView
            data={data}
            searchQuery={searchQuery}
            onUpdateGrade={handleUpdateGrade}
          />
        )
      case 'tasks':
        return (
          <TasksView
            data={data}
            searchQuery={searchQuery}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
          />
        )
      case 'performance-insights':
        return <PerformanceInsightsView data={data} />
      case 'engagement-analytics':
        return <EngagementAnalyticsView data={data} />
      case 'announcements':
        return <AnnouncementsView data={data} searchQuery={searchQuery} />
      case 'schedule':
        return <ScheduleView data={data} />
      case 'profile':
        return (
          <ProfileView
            data={data}
            syncStatus={syncStatus}
            onSeedFirestore={handleSeedFirestore}
            seedingMessage={seedingMessage}
          />
        )
      case 'dashboard':
      default:
        return (
          <DashboardView
            data={data}
            searchQuery={searchQuery}
            onNavigate={setActiveTab}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f5fb] p-3 sm:p-5 lg:h-screen lg:overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1380px] gap-6">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onLogout={() => setLoggedOut(true)}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <main className="flex min-w-0 flex-1 flex-col gap-5 lg:overflow-y-auto lg:pr-1">
          <Header
            student={data.student}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            announcements={data.announcements}
            syncStatus={syncStatus}
            onNavigate={setActiveTab}
          />

          <div className="pb-4">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}
