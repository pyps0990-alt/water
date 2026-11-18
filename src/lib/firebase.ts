import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore/lite'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/** False until the Firebase web config is provided; UI then shows defaults. */
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId)
export const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true'

let app: FirebaseApp | undefined
let db: Firestore | undefined

export function getApp(): FirebaseApp {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured')
  return (app ??= initializeApp(config))
}

export function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getApp())
    if (useEmulators) connectFirestoreEmulator(db, '127.0.0.1', 8080)
  }
  return db
}
