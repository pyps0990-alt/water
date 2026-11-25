import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { getAuth } from 'firebase-admin/auth'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { setGlobalOptions } from 'firebase-functions/v2'

initializeApp()
setGlobalOptions({ region: 'asia-east1', maxInstances: 5 })
const db = getFirestore()

const SOURCES = ['google_business', 'line', 'ig', 'fb', 'threads', 'direct']
const CATEGORIES = ['electrical', 'plumbing', 'fixtures', 'weak_current']
const BUILDING_TYPES = ['townhouse', 'apartment', 'storefront', 'office_factory']
const PHOTO_PATH = /^case-uploads\/[A-Za-z0-9_-]{16,40}\/[1-5]\.webp$/

/** Date parts in Asia/Taipei. */
function taipeiDate(d = new Date()) {
  const t = new Date(d.getTime() + 8 * 3600_000)
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, day: t.getUTCDate(), dow: t.getUTCDay(), t }
}
const pad = (n: number) => String(n).padStart(2, '0')

function str(v: unknown, field: string, max: number, required = true): string {
  if (typeof v !== 'string' || (required && !v.trim()) || v.length > max) {
    throw new HttpsError('invalid-argument', `欄位 ${field} 格式錯誤`)
  }
  return v.trim()
}
function oneOf(v: unknown, field: string, list: string[]): string {
  if (typeof v !== 'string' || !list.includes(v)) throw new HttpsError('invalid-argument', `欄位 ${field} 不在允許值內`)
  return v
}

/**
 * Creates a case atomically: validates input, enforces maxWeeklyCases,
 * assigns WE-YYYYMMDD-NN, and increments schedules/{today}.bookedCount.
 */
export const createCase = onCall(async (req) => {
  const d = req.data ?? {}
  const c = d.clientInfo ?? {}
  const p = d.problemReport ?? {}

  const phone = str(c.phone, 'phone', 20)
  if (!/^[0-9+\-\s]{8,20}$/.test(phone)) throw new HttpsError('invalid-argument', '電話格式錯誤')

  const photoPaths: unknown = p.photoPaths ?? []
  if (!Array.isArray(photoPaths) || photoPaths.length > 5 ||
      !photoPaths.every((u) => typeof u === 'string' && PHOTO_PATH.test(u)) ||
      new Set(photoPaths).size !== photoPaths.length) {
    throw new HttpsError('invalid-argument', '照片最多 5 張')
  }
  // Only accept photos that were actually uploaded through the storage rules.
  const bucket = getStorage().bucket()
  const exists = await Promise.all(photoPaths.map((path: string) => bucket.file(path).exists().then(([e]) => e)))
  if (exists.includes(false)) throw new HttpsError('invalid-argument', '照片上傳未完成，請重新上傳')

  const caseData = {
    status: 'arranging',
    source: SOURCES.includes(d.source) ? d.source : 'direct',
    clientInfo: {
      name: str(c.name, 'name', 50),
      phone,
      lineId: str(c.lineId ?? '', 'lineId', 50, false),
      district: str(c.district, 'district', 50),
      address: str(c.address, 'address', 200),
      buildingType: oneOf(c.buildingType, 'buildingType', BUILDING_TYPES),
    },
    problemReport: {
      category: oneOf(p.category, 'category', CATEGORIES),
      description: str(p.description, 'description', 2000),
      photoPaths,
      preferredTime: str(p.preferredTime ?? '', 'preferredTime', 200, false),
    },
    surveyNotes: '',
    quotation: null,
  }

  const { y, m, day, dow, t } = taipeiDate()
  const ymd = `${y}${pad(m)}${pad(day)}`
  const dateId = `${y}-${pad(m)}-${pad(day)}`
  const monday = new Date(t.getTime() - ((dow + 6) % 7) * 86400_000)
  const weekId = `week-${monday.getUTCFullYear()}-${pad(monday.getUTCMonth() + 1)}-${pad(monday.getUTCDate())}`

  const caseId = await db.runTransaction(async (tx) => {
    const settingsRef = db.doc('system_settings/global')
    const weekRef = db.doc(`counters/${weekId}`)
    const dayRef = db.doc(`counters/day-${ymd}`)
    const schedRef = db.doc(`schedules/${dateId}`)
    const [settings, week, dayCounter] = await Promise.all([
      tx.get(settingsRef), tx.get(weekRef), tx.get(dayRef),
    ])

    const max = settings.get('maxWeeklyCases') ?? 5
    const weekCount = week.get('count') ?? 0
    if (weekCount >= max) {
      throw new HttpsError('resource-exhausted', '本週場勘名額已滿，請下週再預約或透過 LINE 聯繫')
    }

    const seq = (dayCounter.get('seq') ?? 0) + 1
    const id = `WE-${ymd}-${pad(seq)}`
    const now = FieldValue.serverTimestamp()

    tx.set(dayRef, { seq }, { merge: true })
    tx.set(weekRef, { count: weekCount + 1 }, { merge: true })
    tx.set(schedRef, { date: dateId, bookedCount: FieldValue.increment(1) }, { merge: true })
    tx.set(db.doc(`cases/${id}`), { caseId: id, ...caseData, createdAt: now, updatedAt: now })
    return id
  })

  return { caseId }
})

/** Public lookup: Case ID + last 3 phone digits → status only (no PII). */
export const getCaseStatus = onCall(async (req) => {
  const caseId = str(req.data?.caseId, 'caseId', 30).toUpperCase()
  const last3 = str(req.data?.phoneLast3, 'phoneLast3', 3)
  if (!/^WE-\d{8}-\d{2,3}$/.test(caseId) || !/^\d{3}$/.test(last3)) {
    throw new HttpsError('invalid-argument', '查詢格式錯誤')
  }
  const snap = await db.doc(`cases/${caseId}`).get()
  const phone: string = snap.get('clientInfo.phone') ?? ''
  if (!snap.exists || phone.replace(/\D/g, '').slice(-3) !== last3) {
    throw new HttpsError('not-found', '查無此案件，請確認編號與電話末三碼')
  }
  return {
    caseId,
    status: snap.get('status'),
    category: snap.get('problemReport.category'),
    updatedAt: snap.get('updatedAt')?.toDate?.().toISOString() ?? null,
  }
})

/**
 * Grants the `admin` custom claim (used by Storage rules) to a signed-in account
 * whose verified email is listed in /admins/{email}. Idempotent.
 */
export const claimAdmin = onCall(async (req) => {
  const email = req.auth?.token.email
  if (!req.auth || !email || req.auth.token.email_verified !== true) {
    throw new HttpsError('unauthenticated', '請先登入')
  }
  const listed = (await db.doc(`admins/${email}`).get()).exists
  if (!listed) throw new HttpsError('permission-denied', '此帳號沒有管理權限')
  if (req.auth.token.admin !== true) {
    const user = await getAuth().getUser(req.auth.uid)
    await getAuth().setCustomUserClaims(req.auth.uid, { ...(user.customClaims ?? {}), admin: true })
    return { granted: true, refresh: true }
  }
  return { granted: true, refresh: false }
})
