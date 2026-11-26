export function getHonorsStanding(average) {
  const num = Number(average || 0)
  if (num >= 98) {
    return { label: 'With Highest Honors', achieved: true }
  }
  if (num >= 95) {
    return { label: 'With High Honors', achieved: true }
  }
  if (num >= 90) {
    return { label: 'With Honors', achieved: true }
  }
  const gap = Math.max(0.01, 90 - num).toFixed(2)
  return { label: `${gap} pts to Honors`, achieved: false }
}

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
  const honors = getHonorsStanding(average)
  const completedTasks = tasks.filter((t) => t.completed).length

  const rows = [
    ['Trackable Dash (NU MOA CT Senior High) - Student Academic Report'],
    ['Name', student.name],
    ['Section', student.section || '12SHS2510'],
    ['Student ID', student.studentNumber],
    ['Email', student.email],
    ['Grade Average', average],
    ['Academic Standing', honors.label],
    ['Attendance Rate', `${student.attendanceRate}%`],
    ['Tasks Completed', `${completedTasks}/${tasks.length}`],
    [],
    ['Subject', 'Teacher', 'Progress %', 'Grade'],
    ...subjects.map((s) => [s.name, s.teacher, `${s.progress}%`, s.grade]),
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
