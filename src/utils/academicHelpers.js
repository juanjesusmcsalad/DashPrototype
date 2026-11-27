function escapeCsv(value) {
  const text = String(value ?? '')
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replaceAll('"', '""')}"`
  }
  return text
}

export function downloadStudentCsv(data) {
  const { student, subjects = [], tasks = [] } = data
  const average =
    subjects.length > 0
      ? (subjects.reduce((sum, s) => sum + Number(s.grade || 0), 0) / subjects.length).toFixed(2)
      : '0.00'
  const completedTasks = tasks.filter((t) => t.completed).length

  const rows = [
    ['Trackable Dash (NU MOA CT Senior High) - Student Academic Report'],
    ['Name', student.name],
    ['Section', student.section || '12SHS2510'],
    ['Student ID', student.studentNumber],
    ['Email', student.email],
    ['Grade Average', average],
    ['Attendance Rate', `${student.attendanceRate}%`],
    ['Tasks Completed', `${completedTasks}/${tasks.length}`],
    [],
    ['Subject', 'Teacher', 'Grade'],
    ...subjects.map((s) => [s.name, s.teacher, s.grade]),
  ]

  const csvContent = rows.map((row) => row.map(escapeCsv).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const safeName = (student.name || 'student').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  link.href = url
  link.download = `${safeName}-academic-report.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function formatTaskDueDate(rawValue) {
  const clean = String(rawValue || '').trim()
  if (!clean) return 'No due date'
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [year, month, day] = clean.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }
  return clean
}

export function computeSubjectAverage(subjects = []) {
  if (!Array.isArray(subjects) || subjects.length === 0) return 0
  const total = subjects.reduce((sum, s) => sum + Number(s.grade || 0), 0)
  return Number((total / subjects.length).toFixed(2))
}

export function resolveGradeHistory(gradeHistory, subjects = []) {
  const labels =
    Array.isArray(gradeHistory?.labels) && gradeHistory.labels.length > 0
      ? gradeHistory.labels
      : ['Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const rawValues = Array.isArray(gradeHistory?.values)
    ? gradeHistory.values.map((v) => Number(v || 0))
    : labels.map(() => 0)

  const values = labels.map((_, idx) => rawValues[idx] ?? 0)
  const avg = computeSubjectAverage(subjects)
  const allZero = values.every((v) => v === 0)

  if (allZero && avg > 0 && values.length > 0) {
    values[values.length - 1] = avg
  }

  return { labels, values }
}

export function generateAutoRecommendations(data) {
  const student = data?.student || {}
  const subjects = Array.isArray(data?.subjects) ? data.subjects : []
  const tasks = Array.isArray(data?.tasks) ? data.tasks : []
  const weekly = data?.weeklyEngagement || {}

  const gradedSubjects = subjects.filter((s) => Number(s.grade || 0) > 0)
  const att = Number(student.attendanceRate ?? 0)
  const pendingTasks = tasks.filter((t) => !t.completed)
  const studyTotal = (weekly.studyHours || []).reduce((sum, h) => sum + Number(h || 0), 0)
  const targetTotal = (weekly.targetHours || []).reduce((sum, h) => sum + Number(h || 0), 0)

  if (gradedSubjects.length === 0 && tasks.length === 0 && att === 0 && studyTotal === 0) {
    return []
  }

  const auto = []

  if (gradedSubjects.length > 0) {
    const sorted = [...gradedSubjects].sort((a, b) => Number(a.grade) - Number(b.grade))
    const lowest = sorted[0]
    const highest = sorted[sorted.length - 1]

    if (Number(lowest.grade) < 85) {
      auto.push({
        id: `auto-low-${lowest.id}`,
        text: `Prioritize extra review in ${lowest.name} (${lowest.grade}%) with ${lowest.teacher} to lift your grade above 85%.`,
        category: 'Academics',
        priority: Number(lowest.grade) < 80 ? 'High' : 'Medium',
        isAuto: true,
      })
    } else if (Number(lowest.grade) < 90) {
      auto.push({
        id: `auto-focus-${lowest.id}`,
        text: `Target a 3–5 point boost in ${lowest.name} (${lowest.grade}%) to raise your overall average into the 90+ range.`,
        category: 'Academics',
        priority: 'Medium',
        isAuto: true,
      })
    } else {
      auto.push({
        id: `auto-strong-${highest.id}`,
        text: `Strong consistency across graded subjects, led by ${highest.name} (${highest.grade}%). Keep up your current study pace.`,
        category: 'Momentum',
        priority: 'Normal',
        isAuto: true,
      })
    }
  }

  if (att > 0 && att < 90) {
    auto.push({
      id: 'auto-attendance',
      text: `Attendance is at ${att}%. Aim for 95%+ attendance to stay on track with discussions and class activities.`,
      category: 'Attendance',
      priority: att < 80 ? 'High' : 'Medium',
      isAuto: true,
    })
  }

  if (pendingTasks.length > 0) {
    const first = pendingTasks[0]
    const dueLabel =
      first.dueDate && first.dueDate !== 'No due date' ? `, due ${first.dueDate}` : ''
    auto.push({
      id: 'auto-tasks',
      text: `You have ${pendingTasks.length} pending task${pendingTasks.length === 1 ? '' : 's'} — start with "${first.title}" (${first.subject}${dueLabel}).`,
      category: 'Tasks',
      priority: pendingTasks.length >= 3 ? 'High' : 'Medium',
      isAuto: true,
    })
  }

  if (targetTotal > 0 && studyTotal < targetTotal * 0.75) {
    const remaining = (targetTotal - studyTotal).toFixed(1)
    auto.push({
      id: 'auto-study-target',
      text: `Log ${remaining} more study hrs this week to meet your ${targetTotal.toFixed(1)} hr weekly engagement target.`,
      category: 'Study Plan',
      priority: 'Medium',
      isAuto: true,
    })
  } else if (gradedSubjects.length > 0 && studyTotal === 0) {
    auto.push({
      id: 'auto-study-log',
      text: 'Log your daily study sessions in Engagement Analytics to monitor how study hours support your grades.',
      category: 'Study Plan',
      priority: 'Normal',
      isAuto: true,
    })
  }

  return auto
}

export function getMergedRecommendations(data) {
  const manual = Array.isArray(data?.recommendations) ? data.recommendations : []
  const auto = generateAutoRecommendations(data)
  const seen = new Set(manual.map((r) => String(r.text || '').trim().toLowerCase()))
  const merged = [...manual]

  for (const item of auto) {
    const key = item.text.trim().toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      merged.push(item)
    }
  }

  return merged
}
