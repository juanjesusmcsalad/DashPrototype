export const ALLOWED_SUBJECTS = [
  { id: 'philippine-governance', name: 'Philippine Governance', shortName: 'Philippine Governance', grade: 91, teacher: 'Mr. Min Soo T. Kim' },
  { id: 'research', name: 'Research', shortName: 'Research', grade: 93, teacher: 'Mr. Joash J. Goboy' },
  { id: 'database-management', name: 'Database Management', shortName: 'Database Management', grade: 90, teacher: 'Ms. Ricca Mae P. Mique' },
  { id: 'finite-mathematics', name: 'Finite Mathematics', shortName: 'Finite Mathematics', grade: 86, teacher: 'Brimstone' },
  { id: 'creative-industries', name: 'Creative Industries', shortName: 'Creative Industries', grade: 88, teacher: 'Ms. Jasmin M. Garzota' },
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
    adviser: 'Brimstone',
    studentNumber: 'SHS-2026-0418',
    displayDate: 'December 4, 2026',
    attendanceRate: 96,
    presentDays: 96,
    totalDays: 100,
  },
  subjects: ALLOWED_SUBJECTS,
  gradeHistory: {
    labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    values: [86.5, 87.8, 88.4, 89.1, 89.6],
  },
  weeklyEngagement: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    studyHours: [3.2, 4.0, 3.5, 4.4, 3.8, 2.5, 1.8],
    targetHours: [3.5, 3.5, 3.5, 3.5, 3.5, 2.0, 1.5],
  },
  recommendations: [
    {
      id: 'rec-1',
      text: 'Review Finite Mathematics lessons.',
      category: 'Academics',
      priority: 'High',
    },
    {
      id: 'rec-2',
      text: 'Practice Database Management queries.',
      category: 'Study Plan',
      priority: 'Medium',
    },
    {
      id: 'rec-3',
      text: 'Submit Research Chapter 3 draft.',
      category: 'Research',
      priority: 'High',
    },
    {
      id: 'rec-4',
      text: 'Maintain attendance above 95%.',
      category: 'Attendance',
      priority: 'Normal',
    },
  ],
  tasks: [],
  announcements: [],
  schedule: [],
}
