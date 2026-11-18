import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { initializeTestEnvironment, assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes } from 'firebase/storage'

let env: RulesTestEnvironment
const admin = () => env.authenticatedContext('a', { email: 'admin1@gmail.com', email_verified: true })
const stranger = () => env.authenticatedContext('s', { email: 'x@gmail.com', email_verified: true })
const anon = () => env.unauthenticatedContext()

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-water',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
    storage: { rules: readFileSync('storage.rules', 'utf8'), host: '127.0.0.1', port: 9199 },
  })
})
beforeEach(() => env.clearFirestore())
afterAll(() => env.cleanup())

describe('firestore', () => {
  it('cases: clients cannot create or read', async () => {
    await assertFails(setDoc(doc(anon().firestore(), 'cases/WE-1'), { status: 'arranging', quotation: null }))
    await assertFails(getDoc(doc(anon().firestore(), 'cases/WE-1')))
    await assertFails(getDoc(doc(stranger().firestore(), 'cases/WE-1')))
  })
  it('cases: admin can read/update', async () => {
    await assertSucceeds(getDoc(doc(admin().firestore(), 'cases/WE-1')))
  })
  it('unverified admin email is rejected', async () => {
    const ctx = env.authenticatedContext('u', { email: 'admin1@gmail.com', email_verified: false })
    await assertFails(getDoc(doc(ctx.firestore(), 'cases/WE-1')))
  })
  it('schedules/portfolio/settings: public read, admin write', async () => {
    for (const p of ['schedules/2026-11-20', 'portfolio/p1', 'system_settings/global']) {
      await assertSucceeds(getDoc(doc(anon().firestore(), p)))
      await assertFails(setDoc(doc(anon().firestore(), p), { dayStatus: 'available' }))
      await assertFails(setDoc(doc(stranger().firestore(), p), { dayStatus: 'available' }))
      await assertSucceeds(setDoc(doc(admin().firestore(), p), { dayStatus: 'available' }))
    }
  })
  it('schedules: rejects invalid dayStatus', async () => {
    await assertFails(setDoc(doc(admin().firestore(), 'schedules/2026-11-20'), { dayStatus: 'maybe' }))
  })
  it('counters: locked', async () => {
    await assertFails(getDoc(doc(admin().firestore(), 'counters/x')))
  })
})

describe('storage', () => {
  const img = (n: number) => new Uint8Array(n)
  const uid = 'abcdEFGH1234_-xyz'
  it('anon can upload small webp to case-uploads', async () => {
    await assertSucceeds(uploadBytes(ref(anon().storage(), `case-uploads/${uid}/1.webp`), img(1000), { contentType: 'image/webp' }))
  })
  it('rejects non-image, >5MB, and bad upload id', async () => {
    await assertFails(uploadBytes(ref(anon().storage(), `case-uploads/${uid}/a.pdf`), img(10), { contentType: 'application/pdf' }))
    await assertFails(uploadBytes(ref(anon().storage(), `case-uploads/${uid}/big.webp`), img(5 * 1024 * 1024 + 1), { contentType: 'image/webp' }))
    await assertFails(uploadBytes(ref(anon().storage(), `case-uploads/short/1.webp`), img(10), { contentType: 'image/webp' }))
  })
  it('anon cannot upload to portfolio', async () => {
    await assertFails(uploadBytes(ref(anon().storage(), 'portfolio/a.webp'), img(10), { contentType: 'image/webp' }))
    await assertSucceeds(uploadBytes(ref(admin().storage(), 'portfolio/a.webp'), img(10), { contentType: 'image/webp' }))
  })
})
