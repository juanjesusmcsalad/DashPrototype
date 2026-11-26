import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../firebase'
import { buildInitialStudentRecord, ensureDemoStudentRecord } from './studentService'

const DEMO_USERS_KEY = 'dashprototype_demo_users_v1'
const DEMO_SESSION_KEY = 'dashprototype_demo_session_v1'

const DEFAULT_DEMO_USERS = [
  {
    uid: 'carlos-conde',
    name: 'Carlos Conde',
    email: 'carlos.conde@ctseniorhigh.edu.ph',
    password: 'student123',
    role: 'student',
    strand: 'Grade 12 — HUMSS / Research Track',
  },
  {
    uid: 'admin-ctsh',
    name: 'Dr. Elena Santos',
    email: 'admin@ctseniorhigh.edu.ph',
    password: 'admin123',
    role: 'admin',
    strand: 'School Administrator',
  },
]

function getConfiguredAdminEmails() {
  const raw = import.meta.env.VITE_ADMIN_EMAILS || ''
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

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
  const adminEmails = getConfiguredAdminEmails()
  const emailLower = (firebaseUser.email || '').toLowerCase()
  let role = adminEmails.includes(emailLower) ? 'admin' : 'student'
  let name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student'
  let strand = 'Grade 12 — Senior High Track'

  if (db) {
    try {
      const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (userSnap.exists()) {
        const userData = userSnap.data()
        role = userData.role || role
        name = userData.name || name
        strand = userData.strand || strand
      }
    } catch {
      // Keep default resolved metadata if user profile doc is unreadable.
    }
  }

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    name,
    role,
    strand,
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

export async function signUpStudent({ name, email, password, strand }) {
  const cleanEmail = email.trim().toLowerCase()
  const cleanName = name.trim()

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
      strand: strand || 'Grade 12 — Senior High Track',
    }
    writeDemoUsers([...users, newUser])
    ensureDemoStudentRecord(uid, newUser)
    const sessionUser = {
      uid: newUser.uid,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      strand: newUser.strand,
    }
    writeDemoSession(sessionUser)
    return sessionUser
  }

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password)
  await updateProfile(cred.user, { displayName: cleanName })

  const userProfile = {
    uid: cred.user.uid,
    name: cleanName,
    email: cleanEmail,
    role: 'student',
    school: 'CT SENIOR HIGH',
    strand: strand || 'Grade 12 — Senior High Track',
    createdAt: new Date().toISOString(),
  }

  await setDoc(doc(db, 'users', cred.user.uid), userProfile)
  await setDoc(
    doc(db, 'students', cred.user.uid),
    buildInitialStudentRecord(cred.user.uid, userProfile)
  )

  return userProfile
}

export async function signInWithRole({ email, password, expectedRole = 'student' }) {
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
    const sessionUser = {
      uid: match.uid,
      name: match.name,
      email: match.email,
      role: match.role,
      strand: match.strand,
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

  return profile
}

export async function signOutUser() {
  if (!isFirebaseConfigured || !auth) {
    writeDemoSession(null)
    return
  }
  await signOut(auth)
}
