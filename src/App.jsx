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
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('dashprototype_theme') === 'dark'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', darkMode)
    try {
      localStorage.setItem('dashprototype_theme', darkMode ? 'dark' : 'light')
    } catch {
      // Ignore storage write errors.
    }
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode((prev) => !prev)

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

  const handleLogStudyHours = async (dayIndex, hoursToAdd) => {
    if (!currentUser) return
    const baseEngagement = data.weeklyEngagement || DEFAULT_STUDENT_DATA.weeklyEngagement
    const currentHours = [...(baseEngagement.studyHours || [0, 0, 0, 0, 0, 0, 0])]
    const nextVal = Number((Number(currentHours[dayIndex] || 0) + Number(hoursToAdd || 0)).toFixed(1))
    currentHours[dayIndex] = Math.min(16, Math.max(0, nextVal))
    const updatedEngagement = {
      labels: baseEngagement.labels || DEFAULT_STUDENT_DATA.weeklyEngagement.labels,
      targetHours: baseEngagement.targetHours || DEFAULT_STUDENT_DATA.weeklyEngagement.targetHours,
      studyHours: currentHours,
    }
    setData((prev) => ({ ...prev, weeklyEngagement: updatedEngagement }))
    try {
      await updateStudentFields(currentUser.uid, { weeklyEngagement: updatedEngagement })
    } catch (err) {
      setSyncStatus((prev) => ({ ...prev, error: err.message }))
    }
  }

  const handleLogout = async () => {
    await signOutUser()
  }

  if (currentUser === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6fb] text-sm font-semibold text-[#35408e] dark:bg-[#0f1326] dark:text-[#ffd41c]">
        Loading portal...
      </div>
    )
  }

  if (!currentUser) {
    return <AuthView darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
  }

  if (currentUser.role === 'admin') {
    return (
      <AdminDashboardView
        currentUser={currentUser}
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'academic-progress':
        return (
          <AcademicProgressView
            data={data}
            searchQuery={searchQuery}
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
        return (
          <EngagementAnalyticsView
            data={data}
            onLogStudyHours={handleLogStudyHours}
          />
        )
      case 'announcements':
        return <AnnouncementsView data={data} searchQuery={searchQuery} />
      case 'schedule':
        return <ScheduleView data={data} />
      case 'profile':
        return <ProfileView data={data} />
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
    <div className="min-h-screen bg-[#f5f6fb] p-3 transition-colors sm:p-5 lg:h-screen lg:overflow-hidden dark:bg-[#0f1326]">
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
            onNavigate={setActiveTab}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />

          {syncStatus.error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
              Sync warning: {syncStatus.error}
            </div>
          )}

          <div className="pb-4">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}
