// Seeds a Firebase project with the admin whitelist and default public settings.
// Run in CI with GOOGLE_APPLICATION_CREDENTIALS set. Never prints the emails.
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { readFileSync } from 'node:fs'

const projectId = process.env.FIREBASE_PROJECT
initializeApp({ credential: applicationDefault(), projectId })
const db = getFirestore()

const emails = (process.env.ADMIN_EMAILS ?? '').split(/[,\s]+/).map((e) => e.trim().toLowerCase()).filter(Boolean)
for (const email of emails) {
  await db.doc(`admins/${email}`).set({ role: 'owner', updatedAt: FieldValue.serverTimestamp() }, { merge: true })
}
console.log(`admins: ${emails.length} account(s) ensured`)

const ref = db.doc('system_settings/global')
const snap = await ref.get()
if (!snap.exists) {
  const seed = JSON.parse(readFileSync(new URL('./seed-settings.json', import.meta.url), 'utf8'))
  seed.companyInfo.name = '水電工程工作室'
  seed.companyInfo.taxId = ''
  seed.companyInfo.phone = ''
  seed.companyInfo.bankAccount = ''
  seed.companyInfo.lineOfficialUrl = ''
  seed.licenses = []
  await ref.set(seed)
  console.log('system_settings/global: created with defaults')
} else {
  console.log('system_settings/global: already exists, left unchanged')
}
