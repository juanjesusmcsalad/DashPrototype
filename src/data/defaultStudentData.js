export const ALLOWED_SUBJECTS = [
  { id: 'philippine-governance', name: 'Philippine Governance', shortName: 'Philippine Governance', grade: 91, progress: 88, teacher: 'Mr. L. Bautista' },
  { id: 'research', name: 'Research', shortName: 'Research', grade: 93, progress: 92, teacher: 'Mr. R. Villanueva' },
  { id: 'database-management', name: 'Database Management', shortName: 'Database Management', grade: 90, progress: 85, teacher: 'Ms. K. Mendoza' },
  { id: 'finite-mathematics', name: 'Finite Mathematics', shortName: 'Finite Mathematics', grade: 86, progress: 76, teacher: 'Mr. J. Cruz' },
  { id: 'creative-industries', name: 'Creative Industries', shortName: 'Creative Industries', grade: 88, progress: 84, teacher: 'Ms. L. Reyes' },
]

export const DEFAULT_STUDENT_DATA = {
  student: {
    id: 'carlos-conde',
    name: 'Carlos Conde',
    firstName: 'Carlos',
    school: 'CT SENIOR HIGH',
    section: '12SHS2510',
    strand: 'Grade 12 — Section 12SHS2510',
    email: 'carlos.conde@ctseniorhigh.edu.ph',
    adviser: 'Ms. Elena Santos',
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
  researchMilestones: [
    { id: 'ch-1', label: 'Ch. 1: Problem & Background', completed: true },
    { id: 'ch-2', label: 'Ch. 2: Review of Literature', completed: true },
    { id: 'ch-3', label: 'Ch. 3: Methodology', completed: false },
    { id: 'ch-4', label: 'Ch. 4: Data & Results', completed: false },
    { id: 'ch-5', label: 'Ch. 5: Summary & Conclusion', completed: false },
    { id: 'defense', label: 'Final Oral Defense', completed: false },
  ],
}
