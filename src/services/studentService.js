import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { DEFAULT_STUDENT_DATA } from '../data/defaultStudentData'
import { db, isFirebaseConfigured } from '../firebase'

const STUDENT_DOC_PATH = ['students', 'carlos-conde']

/**
 * Subscribe to the student dashboard document in Firestore.
 * Falls back cleanly to local demo data when Firebase env vars are not set.
 */
export function subscribeToStudentData(onData, onStatusChange) {
  if (!isFirebaseConfigured || !db) {
    onData(DEFAULT_STUDENT_DATA)
    onStatusChange?.({ mode: 'demo', error: null })
    return () => {}
  }

  const docRef = doc(db, ...STUDENT_DOC_PATH)
  const unsubscribe = onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        onData({ ...DEFAULT_STUDENT_DATA, ...snapshot.data() })
        onStatusChange?.({ mode: 'firestore', error: null })
      } else {
        // Initialize the Firestore document once if it does not exist yet.
        try {
          await setDoc(docRef, DEFAULT_STUDENT_DATA)
          onData(DEFAULT_STUDENT_DATA)
          onStatusChange?.({ mode: 'firestore', error: null })
        } catch (err) {
          onData(DEFAULT_STUDENT_DATA)
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
 * Persist partial updates (e.g., tasks or subjects) to Firestore when connected.
 */
export async function updateStudentFields(partialData) {
  if (!isFirebaseConfigured || !db) return { synced: false }
  const docRef = doc(db, ...STUDENT_DOC_PATH)
  await updateDoc(docRef, partialData)
  return { synced: true }
}

/**
 * Reset or seed the student document in Firestore back to the default demo dataset.
 */
export async function seedDemoStudentData() {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase environment variables are not configured yet.')
  }
  const docRef = doc(db, ...STUDENT_DOC_PATH)
  await setDoc(docRef, DEFAULT_STUDENT_DATA)
}
