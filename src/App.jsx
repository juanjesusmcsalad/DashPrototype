import { useEffect, useState } from 'react'
import AdminDashboardView from './components/AdminDashboardView'
import AuthView from './components/AuthView'
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
import { signOutUser, subscribeToAuthState } from './services/authService'
import {
  seedDemoStudentData,
  subscribeToStudentData,
  updateStudentFields,
} from './services/studentService'

export default function App() {
  const [currentUser, setCurrentUser] = useState(undefined) // undefined = checking auth
  const [data, setData] = useState(DEFAULT_STUDENT_DATA)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState({ mode: 'demo', error: null })
  const [seedingMessage, setSeedingMessage] = useState('')

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      setCurrentUser(user)
      setActiveTab('dashboard')
      setSearchQuery('')
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!currentUser || currentUser.role === 'admin') return undefined
    const unsubscribe = subscribeToStudentData(
      currentUser.uid,
      currentUser,
      setData,
      setSyncStatus
    )
    return () => unsubscribe()
  }, [currentUser])

  const handleToggleTask = async (taskId) => {
    if (!currentUser) return
    const updatedTasks = data.tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
    setData((prev) => ({ ...prev, tasks: updatedTasks }))
    try {
      await updateStudentFields(currentUser.uid, { tasks: updatedTasks })
    } catch (err) {
      setSyncStatus((prev) => ({ ...prev, error: err.message }))
    }
  }

  const handleAddTask = async (newTask) => {
    if (!currentUser) return
    const updatedTasks = [newTask, ...data.tasks]
    setData((prev) => ({ ...prev, tasks: updatedTasks }))
    try {
      await updateStudentFields(currentUser.uid, { tasks: updatedTasks })
    } catch (err) {
      setSyncStatus((prev) => ({ ...prev, error: err.message }))
    }
  }

  const handleUpdateGrade = async (subjectId, newGrade) => {
    if (!currentUser) return
    const safeGrade = Math.min(100, Math.max(60, Number.isNaN(newGrade) ? 60 : newGrade))
    const updatedSubjects = data.subjects.map((subj) =>
      subj.id === subjectId ? { ...subj, grade: safeGrade } : subj
    )
    setData((prev) => ({ ...prev, subjects: updatedSubjects }))
    try {
      await updateStudentFields(currentUser.uid, { subjects: updatedSubjects })
    } catch (err) {
      setSyncStatus((prev) => ({ ...prev, error: err.message }))
    }
  }

  const handleSeedFirestore = async () => {
    if (!currentUser) return
    setSeedingMessage('Syncing...')
    try {
      await seedDemoStudentData(currentUser.uid, currentUser)
      setSeedingMessage('Demo data saved!')
    } catch (err) {
      setSeedingMessage(err.message)
    }
  }

  const handleLogout = async () => {
    await signOutUser()
  }

  if (currentUser === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6fb] text-sm font-semibold text-[#35408e]">
        Loading portal...
      </div>
    )
  }

  if (!currentUser) {
    return <AuthView />
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboardView currentUser={currentUser} onLogout={handleLogout} />
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
    <div className="min-h-screen bg-[#f5f6fb] p-3 sm:p-5 lg:h-screen lg:overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1380px] gap-6">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onLogout={handleLogout}
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
