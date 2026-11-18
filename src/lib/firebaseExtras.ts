// Loaded on demand (dynamic import) so the landing page stays light.
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage'
import { getAuth, connectAuthEmulator, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { getFunctions, connectFunctionsEmulator, httpsCallable, type Functions } from 'firebase/functions'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getApp, useEmulators } from './firebase'

let storage: FirebaseStorage | undefined
let auth: Auth | undefined
let functions: Functions | undefined

export function getStore(): FirebaseStorage {
  if (!storage) {
    storage = getStorage(getApp())
    if (useEmulators) connectStorageEmulator(storage, '127.0.0.1', 9199)
  }
  return storage
}

export function getAuthInstance(): Auth {
  if (!auth) {
    auth = getAuth(getApp())
    if (useEmulators) connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  }
  return auth
}

export function getFns(): Functions {
  if (!functions) {
    functions = getFunctions(getApp(), 'asia-east1')
    if (useEmulators) connectFunctionsEmulator(functions, '127.0.0.1', 5001)
  }
  return functions
}

export async function callFn<Req, Res>(name: string, data: Req): Promise<Res> {
  const res = await httpsCallable<Req, Res>(getFns(), name)(data)
  return res.data
}

export async function uploadFile(path: string, file: Blob, contentType: string): Promise<void> {
  await uploadBytes(ref(getStore(), path), file, { contentType })
}

export async function fileUrl(path: string): Promise<string> {
  return getDownloadURL(ref(getStore(), path))
}

export const googleProvider = new GoogleAuthProvider()
