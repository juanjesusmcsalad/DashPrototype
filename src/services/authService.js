import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { collection, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../firebase'
import {
  buildInitialStudentRecord,
  ensureDemoStudentRecord,
  fetchRemoteSchoolConfig,
} from './studentService'

export const ALLOWED_SECTIONS = ['12SHS2510', '12SHS2509']

const DEMO_USERS_KEY = 'dashprototype_demo_users_v4'
const DEMO_SESSION_KEY = 'dashprototype_demo_session_v4'

export const ADMIN_EMAILS = [
  'johannpaulreblando@gmail.com',
  'paulvincentlaguardia@gmail.com',
  'danielvn2012@gmail.com',
  'carloslouieconde@gmail.com',
]

const DEFAULT_DEMO_USERS = [
  {
    uid: 'admin-johann',
    name: 'Johann Paul Reblando',
    email: 'johannpaulreblando@gmail.com',
    password: 'Fortnite2025.12.20-17.39.08.06.DVR',
    role: 'admin',
    section: 'Admin',
  },
  {
    uid: 'admin-paul',
    name: 'Paul Vincent Laguardia',
    email: 'paulvincentlaguardia@gmail.com',
    password: 'Fortnite2025.12.20-17.39.08.06.DVR',
    role: 'admin',
    section: 'Admin',
  },
  {
    uid: 'admin-daniel',
    name: 'Daniel',
    email: 'danielvn2012@gmail.com',
    password: 'Fortnite2025.12.20-17.39.08.06.DVR',
    role: 'admin',
    section: 'Admin',
  },
  {
    uid: 'admin-carlos',
    name: 'Carlos Louie Conde',
    email: 'carloslouieconde@gmail.com',
    password: 'Fortnite2025.12.20-17.39.08.06.DVR',
    role: 'admin',
    section: 'Admin',
  },
]

function readDemoUsers() {
  try {
    const raw = localStorage.getItem(DEMO_USERS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const merged = [...parsed]
        let changed = false
        for (const admin of DEFAULT_DEMO_USERS) {
          const exists = merged.some(
            (u) => u.email?.toLowerCase() === admin.email.toLowerCase()
          )
          if (!exists) {
            merged.push(admin)
            changed = true
          }
        }
        if (changed) writeDemoUsers(merged)
        return merged
      }
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
    const raw =
      sessionStorage.getItem(DEMO_SESSION_KEY) ?? localStorage.getItem(DEMO_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeDemoSession(sessionUser, staySignedIn = true) {
  try {
    localStorage.removeItem(DEMO_SESSION_KEY)
    sessionStorage.removeItem(DEMO_SESSION_KEY)
    if (sessionUser) {
      const storage = staySignedIn ? localStorage : sessionStorage
      storage.setItem(DEMO_SESSION_KEY, JSON.stringify(sessionUser))
    }
    window.dispatchEvent(new CustomEvent('dashprototype-auth-changed'))
  } catch {
    // Ignore storage write errors.
  }
}

async function resolveFirebaseUserProfile(firebaseUser) {
  const cleanEmail = (firebaseUser.email || '').toLowerCase()
  const isAllowlistedAdmin = ADMIN_EMAILS.includes(cleanEmail)
  let role = isAllowlistedAdmin ? 'admin' : 'student'
  let name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student'
  let section = isAllowlistedAdmin ? 'Admin' : '12SHS2510'

  if (db) {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        const userData = userSnap.data()
        role = userData.role === 'admin' || isAllowlistedAdmin ? 'admin' : 'student'
        name = userData.name || name
        section = userData.section || section
        if (isAllowlistedAdmin && userData.role !== 'admin') {
          await setDoc(userRef, { role: 'admin', section: 'Admin', email: cleanEmail }, { merge: true })
        }
      } else if (isAllowlistedAdmin) {
        await setDoc(
          userRef,
          {
            uid: firebaseUser.uid,
            name,
            email: cleanEmail,
            role: 'admin',
            section: 'Admin',
          },
          { merge: true }
        )
      }
    } catch {
      // Default to allowlisted admin or least-privilege 'student' if lookup fails.
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

export async function signUpStudent({ name, email, password, section, staySignedIn = true }) {
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
    writeDemoSession(sessionUser, staySignedIn)
    return sessionUser
  }

  await setPersistence(
    auth,
    staySignedIn ? browserLocalPersistence : browserSessionPersistence
  )
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

  const school = await fetchRemoteSchoolConfig()
  await setDoc(doc(db, 'users', cred.user.uid), userProfile)
  await setDoc(
    doc(db, 'students', cred.user.uid),
    buildInitialStudentRecord(cred.user.uid, userProfile, school)
  )

  return userProfile
}

export async function signInWithRole({
  email,
  password,
  section,
  expectedRole = 'student',
  staySignedIn = true,
}) {
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
    if (expectedRole === 'student' && match.role === 'admin') {
      throw new Error('Please use the Admin Login tab for administrator accounts.')
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
    writeDemoSession(sessionUser, staySignedIn)
    return sessionUser
  }

  await setPersistence(
    auth,
    staySignedIn ? browserLocalPersistence : browserSessionPersistence
  )
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

export async function sendPasswordResetForEmail(email) {
  const cleanEmail = String(email || '').trim().toLowerCase()
  if (!cleanEmail) {
    throw new Error('Account email is missing.')
  }
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Password reset emails require Firebase Auth mode.')
  }
  await sendPasswordResetEmail(auth, cleanEmail)
}
