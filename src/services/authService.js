import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { collection, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../firebase'
import { buildInitialStudentRecord, ensureDemoStudentRecord } from './studentService'

export const ALLOWED_SECTIONS = ['12SHS2510', '12SHS2509']

const DEMO_USERS_KEY = 'dashprototype_demo_users_v3'
const DEMO_SESSION_KEY = 'dashprototype_demo_session_v3'

const DEFAULT_DEMO_USERS = [
  {
    uid: 'carlos-conde',
    name: 'Carlos Conde',
    email: 'carlos.conde@ctseniorhigh.edu.ph',
    password: 'student123',
    role: 'student',
    section: '12SHS2510',
  },
  {
    uid: 'maria-santos',
    name: 'Maria Santos',
    email: 'maria.santos@ctseniorhigh.edu.ph',
    password: 'student123',
    role: 'student',
    section: '12SHS2509',
  },
  {
    uid: 'admin-ctsh',
    name: 'Dr. Elena Santos',
    email: 'admin@ctseniorhigh.edu.ph',
    password: 'admin123',
    role: 'admin',
    section: 'Admin',
  },
]

function readDemoUsers() {
  try {
    const raw = localStorage.getItem(DEMO_USERS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // Ignore storage read errors.
  }
  writeDemoUsers(DEFAULT_DEMO_USERS)
  return DEFAULT_DEMO_USERS
}

function writeDemoUsers(users) {
  try {
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users))
    window.dispatchEvent(new CustomEvent('dashprototype-users-updated'))
  } catch {
    // Ignore storage write errors.
  }
}

function readDemoSession() {
  try {
    const raw = localStorage.getItem(DEMO_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeDemoSession(sessionUser) {
  try {
    if (sessionUser) {
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(sessionUser))
    } else {
      localStorage.removeItem(DEMO_SESSION_KEY)
    }
    window.dispatchEvent(new CustomEvent('dashprototype-auth-changed'))
  } catch {
    // Ignore storage write errors.
  }
}

async function resolveFirebaseUserProfile(firebaseUser) {
  let role = 'student'
  let name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student'
  let section = '12SHS2510'

  if (db) {
    try {
      const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (userSnap.exists()) {
        const userData = userSnap.data()
        role = userData.role === 'admin' ? 'admin' : 'student'
        name = userData.name || name
        section = userData.section || section
      }
    } catch {
      // Default to least-privilege 'student' role if profile lookup fails.
    }
  }

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    name,
    role,
    section,
  }
}

export function subscribeToAuthState(callback) {
  if (!isFirebaseConfigured || !auth) {
    const emitDemo = () => callback(readDemoSession())
    emitDemo()
    window.addEventListener('dashprototype-auth-changed', emitDemo)
    return () => window.removeEventListener('dashprototype-auth-changed', emitDemo)
  }

  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null)
      return
    }
    const profile = await resolveFirebaseUserProfile(firebaseUser)
    callback(profile)
  })
}

export function subscribeToAllUserAccounts(callback) {
  if (!isFirebaseConfigured || !db) {
    const load = () => callback(readDemoUsers())
    load()
    window.addEventListener('dashprototype-users-updated', load)
    return () => window.removeEventListener('dashprototype-users-updated', load)
  }

  const colRef = collection(db, 'users')
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        uid: d.id,
        ...d.data(),
      }))
      callback(list)
    },
    () => {
      callback([])
    }
  )
}

export async function signUpStudent({ name, email, password, section }) {
  const cleanEmail = email.trim().toLowerCase()
  const cleanName = name.trim()
  const safeSection = ALLOWED_SECTIONS.includes(section) ? section : '12SHS2510'

  if (!cleanName) throw new Error('Please enter your full name.')
  if (!cleanEmail) throw new Error('Please enter a valid email address.')
  if (password.length < 6) throw new Error('Password must be at least 6 characters.')

  if (!isFirebaseConfigured || !auth || !db) {
    const users = readDemoUsers()
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email already exists.')
    }
    const uid = `student-${Date.now()}`
    const newUser = {
      uid,
      name: cleanName,
      email: cleanEmail,
      password,
      role: 'student',
      section: safeSection,
    }
    writeDemoUsers([...users, newUser])
    ensureDemoStudentRecord(uid, newUser)
    const sessionUser = {
      uid: newUser.uid,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      section: newUser.section,
    }
    writeDemoSession(sessionUser)
    return sessionUser
  }

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password)
  await updateProfile(cred.user, { displayName: cleanName })

  // Never store plaintext passwords in Firestore.
  const userProfile = {
    uid: cred.user.uid,
    name: cleanName,
    email: cleanEmail,
    role: 'student',
    school: 'NU MOA • CT Senior High',
    section: safeSection,
    createdAt: new Date().toISOString(),
  }

  await setDoc(doc(db, 'users', cred.user.uid), userProfile)
  await setDoc(
    doc(db, 'students', cred.user.uid),
    buildInitialStudentRecord(cred.user.uid, userProfile)
  )

  return userProfile
}

export async function signInWithRole({ email, password, section, expectedRole = 'student' }) {
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail || !password) {
    throw new Error('Please enter both your email and password.')
  }

  if (!isFirebaseConfigured || !auth) {
    const users = readDemoUsers()
    const match = users.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    )
    if (!match) {
      throw new Error('Invalid email or password.')
    }
    if (expectedRole === 'admin' && match.role !== 'admin') {
      throw new Error('This account does not have administrator privileges.')
    }
    if (expectedRole === 'student' && match.role === 'student' && section && match.section !== section) {
      throw new Error(`This account belongs to section ${match.section}, not ${section}.`)
    }
    const sessionUser = {
      uid: match.uid,
      name: match.name,
      email: match.email,
      role: match.role,
      section: match.section,
    }
    writeDemoSession(sessionUser)
    return sessionUser
  }

  const cred = await signInWithEmailAndPassword(auth, cleanEmail, password)
  const profile = await resolveFirebaseUserProfile(cred.user)

  if (expectedRole === 'admin' && profile.role !== 'admin') {
    await signOut(auth)
    throw new Error('This account does not have administrator privileges.')
  }

  if (
    expectedRole === 'student' &&
    profile.role === 'student' &&
    section &&
    profile.section &&
    profile.section !== section
  ) {
    await signOut(auth)
    throw new Error(`This account belongs to section ${profile.section}, not ${section}.`)
  }

  return profile
}

export async function signOutUser() {
  if (!isFirebaseConfigured || !auth) {
    writeDemoSession(null)
    return
  }
  await signOut(auth)
}

export async function updateUserMetadata(uid, updates) {
  if (!isFirebaseConfigured || !db) {
    const users = readDemoUsers()
    const nextUsers = users.map((u) => (u.uid === uid ? { ...u, ...updates } : u))
    writeDemoUsers(nextUsers)
    return
  }
  await setDoc(doc(db, 'users', uid), updates, { merge: true })
}
