import { collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { DEFAULT_STUDENT_DATA } from '../data/defaultStudentData'
import { db, isFirebaseConfigured } from '../firebase'

const DEMO_STUDENTS_KEY = 'dashprototype_demo_students_v5'
const SCHOOL_CONFIG_KEY = 'dashprototype_school_config_v1'

const DEFAULT_SCHOOL_CONFIG = {
  announcements: [],
  schedules: {
    '12SHS2510': [],
    '12SHS2509': [],
  },
}

export function readSchoolConfig() {
  try {
    const raw = localStorage.getItem(SCHOOL_CONFIG_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        return {
          announcements: Array.isArray(parsed.announcements) ? parsed.announcements : [],
          schedules: {
            '12SHS2510': parsed.schedules?.['12SHS2510'] || [],
            '12SHS2509': parsed.schedules?.['12SHS2509'] || [],
          },
        }
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
        const data = snap.data()
        callback({
          announcements: Array.isArray(data.announcements) ? data.announcements : [],
          schedules: {
            '12SHS2510': data.schedules?.['12SHS2510'] || [],
            '12SHS2509': data.schedules?.['12SHS2509'] || [],
          },
        })
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
  writeSchoolConfigLocal(nextConfig)
  if (!isFirebaseConfigured || !db) return
  try {
    await setDoc(doc(db, 'settings', 'school'), nextConfig)
  } catch {
    // Fallback to local config if Firestore rules restrict settings/school writes.
  }
}

export function buildInitialStudentRecord(uid, { name, email, section }) {
  const safeName = (name || 'New Student').trim()
  const firstName = safeName.split(/\s+/)[0] || 'Student'
  const safeSection = section === '12SHS2509' ? '12SHS2509' : '12SHS2510'
  const school = readSchoolConfig()

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
      (ann) => ann.tag === 'All Sections' || ann.tag === safeSection
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
      const sec = record.student?.section || '12SHS2510'
      const school = readSchoolConfig()
      onData({
        ...record,
        schedule:
          school.schedules[sec]?.length > 0 ? school.schedules[sec] : record.schedule || [],
        announcements:
          school.announcements.length > 0
            ? school.announcements.filter((a) => a.tag === 'All Sections' || a.tag === sec)
            : record.announcements || [],
      })
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

  const docRef = doc(db, 'students', targetId)
  const unsubscribe = onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        onData({ ...DEFAULT_STUDENT_DATA, ...snapshot.data() })
        onStatusChange?.({ mode: 'firestore', error: null })
      } else {
        const seedRecord = fallbackProfile
          ? buildInitialStudentRecord(targetId, fallbackProfile)
          : DEFAULT_STUDENT_DATA
        try {
          await setDoc(docRef, seedRecord)
          onData(seedRecord)
          onStatusChange?.({ mode: 'firestore', error: null })
        } catch (err) {
          onData(seedRecord)
          onStatusChange?.({ mode: 'demo', error: err.message })
        }
      }
    },
    (err) => {
      onData(DEFAULT_STUDENT_DATA)
      onStatusChange?.({ mode: 'demo', error: err.message })
    }
  )

  return unsubscribe
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
