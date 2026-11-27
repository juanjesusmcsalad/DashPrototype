import { collection, deleteDoc, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { DEFAULT_STUDENT_DATA } from '../data/defaultStudentData'
import { db, isFirebaseConfigured } from '../firebase'

const DEMO_STUDENTS_KEY = 'dashprototype_demo_students_v5'
const SCHOOL_CONFIG_KEY = 'dashprototype_school_config_v1'

const DEFAULT_SCHOOL_CONFIG = {
  announcements: [],
  notes: [],
  schedules: {
    '12SHS2510': [],
    '12SHS2509': [],
  },
}

function normalizeSchoolConfig(raw) {
  return {
    announcements: Array.isArray(raw?.announcements) ? raw.announcements : [],
    notes: Array.isArray(raw?.notes) ? raw.notes : [],
    schedules: {
      '12SHS2510': Array.isArray(raw?.schedules?.['12SHS2510']) ? raw.schedules['12SHS2510'] : [],
      '12SHS2509': Array.isArray(raw?.schedules?.['12SHS2509']) ? raw.schedules['12SHS2509'] : [],
    },
  }
}

export function readSchoolConfig() {
  try {
    const raw = localStorage.getItem(SCHOOL_CONFIG_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        return normalizeSchoolConfig(parsed)
      }
    }
  } catch {
    // Ignore storage read errors.
  }
  return DEFAULT_SCHOOL_CONFIG
}

function writeSchoolConfigLocal(config) {
  try {
    localStorage.setItem(SCHOOL_CONFIG_KEY, JSON.stringify(config))
    window.dispatchEvent(new CustomEvent('dashprototype-school-updated'))
  } catch {
    // Ignore storage write errors.
  }
}

export async function fetchRemoteSchoolConfig() {
  if (!isFirebaseConfigured || !db) return readSchoolConfig()
  try {
    const snap = await getDoc(doc(db, 'settings', 'school'))
    if (snap.exists()) {
      return normalizeSchoolConfig(snap.data())
    }
  } catch {
    // Fallback to local config if Firestore read fails.
  }
  return readSchoolConfig()
}

export function subscribeToSchoolConfig(callback) {
  if (!isFirebaseConfigured || !db) {
    const emit = () => callback(readSchoolConfig())
    emit()
    window.addEventListener('dashprototype-school-updated', emit)
    return () => window.removeEventListener('dashprototype-school-updated', emit)
  }

  const docRef = doc(db, 'settings', 'school')
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback(normalizeSchoolConfig(snap.data()))
      } else {
        callback(readSchoolConfig())
      }
    },
    () => {
      callback(readSchoolConfig())
    }
  )
}

export async function saveSchoolConfig(nextConfig) {
  const normalized = normalizeSchoolConfig(nextConfig)
  writeSchoolConfigLocal(normalized)
  if (!isFirebaseConfigured || !db) return
  try {
    await setDoc(doc(db, 'settings', 'school'), normalized)
  } catch {
    // Fallback to local config if Firestore rules restrict settings/school writes.
  }
}

function mergeStudentWithSchool(record, school, schoolLoaded = false) {
  const sec = record.student?.section || '12SHS2510'
  const schoolAnnouncements = Array.isArray(school?.announcements)
    ? school.announcements.filter((a) => !a.tag || a.tag === 'All Sections' || a.tag === sec)
    : []
  const schoolNotes = Array.isArray(school?.notes)
    ? school.notes.filter((n) => !n.tag || n.tag === 'All Sections' || n.tag === sec)
    : []
  const schoolSchedule = Array.isArray(school?.schedules?.[sec]) ? school.schedules[sec] : []

  const studentRecs = Array.isArray(record.recommendations) ? record.recommendations : []
  const seenRecIds = new Set(studentRecs.map((r) => r.id))
  const mergedRecs = [
    ...studentRecs,
    ...schoolNotes.filter((n) => !seenRecIds.has(n.id)),
  ]

  return {
    ...record,
    schedule:
      schoolLoaded || schoolSchedule.length > 0 ? schoolSchedule : record.schedule || [],
    announcements:
      schoolLoaded || schoolAnnouncements.length > 0
        ? schoolAnnouncements
        : record.announcements || [],
    recommendations: mergedRecs,
  }
}

export function buildInitialStudentRecord(uid, { name, email, section }, schoolOverride = null) {
  const safeName = (name || 'New Student').trim()
  const firstName = safeName.split(/\s+/)[0] || 'Student'
  const safeSection = section === '12SHS2509' ? '12SHS2509' : '12SHS2510'
  const school = schoolOverride ? normalizeSchoolConfig(schoolOverride) : readSchoolConfig()

  return {
    ...DEFAULT_STUDENT_DATA,
    student: {
      ...DEFAULT_STUDENT_DATA.student,
      id: uid,
      name: safeName,
      firstName,
      email: email || '',
      section: safeSection,
      strand: `Grade 12 — Section ${safeSection}`,
      studentNumber: `SHS-2026-${String(Math.floor(1000 + Math.random() * 9000))}`,
    },
    schedule: school.schedules[safeSection] || [],
    announcements: school.announcements.filter(
      (ann) => !ann.tag || ann.tag === 'All Sections' || ann.tag === safeSection
    ),
    recommendations: school.notes.filter(
      (note) => !note.tag || note.tag === 'All Sections' || note.tag === safeSection
    ),
  }
}

function readDemoStudentsMap() {
  try {
    const raw = localStorage.getItem(DEMO_STUDENTS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') return parsed
    }
  } catch {
    // Ignore storage read errors in restricted environments.
  }

  const initial = {}
  writeDemoStudentsMap(initial)
  return initial
}

function writeDemoStudentsMap(map) {
  try {
    localStorage.setItem(DEMO_STUDENTS_KEY, JSON.stringify(map))
    window.dispatchEvent(new CustomEvent('dashprototype-students-updated'))
  } catch {
    // Ignore storage write errors.
  }
}

export function ensureDemoStudentRecord(uid, profile) {
  const map = readDemoStudentsMap()
  if (!map[uid]) {
    const newRecord = buildInitialStudentRecord(uid, profile)
    map[uid] = newRecord
    writeDemoStudentsMap(map)
  }
  return map[uid]
}

/**
 * Subscribe to a single student's dashboard document in Firestore (or local demo store).
 */
export function subscribeToStudentData(studentId, fallbackProfile, onData, onStatusChange) {
  const targetId = studentId || 'carlos-conde'

  if (!isFirebaseConfigured || !db) {
    const loadDemo = () => {
      const map = readDemoStudentsMap()
      const record =
        map[targetId] ||
        (fallbackProfile ? ensureDemoStudentRecord(targetId, fallbackProfile) : DEFAULT_STUDENT_DATA)
      const school = readSchoolConfig()
      onData(mergeStudentWithSchool(record, school, true))
    }

    loadDemo()
    onStatusChange?.({ mode: 'demo', error: null })
    window.addEventListener('dashprototype-students-updated', loadDemo)
    window.addEventListener('dashprototype-school-updated', loadDemo)
    return () => {
      window.removeEventListener('dashprototype-students-updated', loadDemo)
      window.removeEventListener('dashprototype-school-updated', loadDemo)
    }
  }

  let latestStudent = null
  let latestSchool = DEFAULT_SCHOOL_CONFIG
  let schoolLoaded = false

  const emitCombined = () => {
    if (!latestStudent) return
    onData(mergeStudentWithSchool(latestStudent, latestSchool, schoolLoaded))
  }

  const schoolRef = doc(db, 'settings', 'school')
  const unsubSchool = onSnapshot(
    schoolRef,
    (snap) => {
      if (snap.exists()) {
        latestSchool = normalizeSchoolConfig(snap.data())
        schoolLoaded = true
      } else {
        latestSchool = DEFAULT_SCHOOL_CONFIG
        schoolLoaded = false
      }
      emitCombined()
    },
    () => {
      // Ignore settings/school read errors so student doc still renders.
    }
  )

  const docRef = doc(db, 'students', targetId)
  const unsubscribe = onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        latestStudent = { ...DEFAULT_STUDENT_DATA, ...snapshot.data() }
        emitCombined()
        onStatusChange?.({ mode: 'firestore', error: null })
      } else {
        const seedRecord = fallbackProfile
          ? buildInitialStudentRecord(
              targetId,
              fallbackProfile,
              schoolLoaded ? latestSchool : null
            )
          : DEFAULT_STUDENT_DATA
        try {
          await setDoc(docRef, seedRecord)
          latestStudent = seedRecord
          emitCombined()
          onStatusChange?.({ mode: 'firestore', error: null })
        } catch (err) {
          latestStudent = seedRecord
          emitCombined()
          onStatusChange?.({ mode: 'demo', error: err.message })
        }
      }
    },
    (err) => {
      latestStudent = DEFAULT_STUDENT_DATA
      emitCombined()
      onStatusChange?.({ mode: 'demo', error: err.message })
    }
  )

  return () => {
    unsubscribe()
    unsubSchool()
  }
}

/**
 * Subscribe to all student documents (used by the Admin Portal).
 */
export function subscribeToAllStudents(onStudents, onStatusChange) {
  if (!isFirebaseConfigured || !db) {
    const loadAll = () => {
      const map = readDemoStudentsMap()
      onStudents(Object.entries(map).map(([id, record]) => ({ id, ...record })))
    }
    loadAll()
    onStatusChange?.({ mode: 'demo', error: null })
    window.addEventListener('dashprototype-students-updated', loadAll)
    return () => window.removeEventListener('dashprototype-students-updated', loadAll)
  }

  const colRef = collection(db, 'students')
  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...DEFAULT_STUDENT_DATA,
        ...d.data(),
      }))
      onStudents(list)
      onStatusChange?.({ mode: 'firestore', error: null })
    },
    (err) => {
      onStudents([])
      onStatusChange?.({ mode: 'demo', error: err.message })
    }
  )

  return unsubscribe
}

/**
 * Persist partial updates for a student document.
 */
export async function updateStudentFields(studentId, partialData) {
  const targetId = studentId || 'carlos-conde'

  if (!isFirebaseConfigured || !db) {
    const map = readDemoStudentsMap()
    const current = map[targetId] || DEFAULT_STUDENT_DATA
    map[targetId] = { ...current, ...partialData }
    writeDemoStudentsMap(map)
    return { synced: false }
  }

  const docRef = doc(db, 'students', targetId)
  await updateDoc(docRef, partialData)
  return { synced: true }
}

/**
 * Seed or reset a student document back to the default template.
 */
export async function seedDemoStudentData(studentId, profile) {
  const targetId = studentId || 'carlos-conde'
  const record = profile
    ? buildInitialStudentRecord(targetId, profile)
    : DEFAULT_STUDENT_DATA

  if (!isFirebaseConfigured || !db) {
    const map = readDemoStudentsMap()
    map[targetId] = record
    writeDemoStudentsMap(map)
    return
  }

  const docRef = doc(db, 'students', targetId)
  await setDoc(docRef, record)
}

export async function deleteStudentRecord(studentId) {
  if (!studentId) return

  if (!isFirebaseConfigured || !db) {
    const map = readDemoStudentsMap()
    if (map[studentId]) {
      delete map[studentId]
      writeDemoStudentsMap(map)
    }
    return
  }

  await deleteDoc(doc(db, 'students', studentId))
}
