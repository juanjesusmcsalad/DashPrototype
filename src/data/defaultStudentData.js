export const ALLOWED_SUBJECTS = [
  { id: 'philippine-governance', name: 'Philippine Governance', shortName: 'Philippine Governance', grade: 0, teacher: 'Mr. Min Soo T. Kim' },
  { id: 'research', name: 'Research', shortName: 'Research', grade: 0, teacher: 'Mr. Joash J. Goboy' },
  { id: 'database-management', name: 'Database Management', shortName: 'Database Management', grade: 0, teacher: 'Ms. Ricca Mae P. Mique' },
  { id: 'finite-mathematics', name: 'Finite Mathematics', shortName: 'Finite Mathematics', grade: 0, teacher: 'Sir Jun P. Balili' },
  { id: 'creative-industries', name: 'Creative Industries', shortName: 'Creative Industries', grade: 0, teacher: 'Ms. Jasmin M. Garzota' },
]

export const DEFAULT_STUDENT_DATA = {
  student: {
    id: 'carlos-conde',
    name: 'Carlos Conde',
    firstName: 'Carlos',
    school: 'NU MOA • CT Senior High',
    section: '12SHS2510',
    strand: 'Grade 12 — Section 12SHS2510',
    email: 'carlos.conde@ctseniorhigh.edu.ph',
    adviser: 'Pujan Mehta',
    studentNumber: 'SHS-2026-0418',
    displayDate: 'December 4, 2026',
    attendanceRate: 0,
    presentDays: 0,
    totalDays: 0,
  },
  subjects: ALLOWED_SUBJECTS,
  gradeHistory: {
    labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    values: [0, 0, 0, 0, 0],
  },
  weeklyEngagement: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    studyHours: [0, 0, 0, 0, 0, 0, 0],
    targetHours: [0, 0, 0, 0, 0, 0, 0],
  },
  recommendations: [],
  tasks: [],
  announcements: [],
  schedule: [],
}
