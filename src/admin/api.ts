import {
  arrayUnion, collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, updateDoc, where,
} from 'firebase/firestore/lite'
import { getDb } from '../lib/firebase'
import { computeTotals } from '../lib/quote'
import { taipeiToday } from '../lib/dates'
import { demoApi, isDemo } from './demo'
import type { CaseDoc, CaseStatus, DayStatus, Quotation, ScheduleDoc, SystemSettings } from '../types/models'

export type CaseRow = CaseDoc & { id: string }

export async function listCases(max = 300): Promise<CaseRow[]> {
  if (isDemo()) return demoApi.listCases()
  const snap = await getDocs(query(collection(getDb(), 'cases'), orderBy('createdAt', 'desc'), limit(max)))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as CaseDoc) }))
}

export async function getCase(id: string): Promise<CaseRow | null> {
  if (isDemo()) return demoApi.getCase(id)
  const d = await getDoc(doc(getDb(), 'cases', id))
  return d.exists() ? { id: d.id, ...(d.data() as CaseDoc) } : null
}

/** Status change; `notify` is picked up by the Phase 4 Cloud Function (LINE / Gmail). */
export async function setStatus(id: string, status: CaseStatus, notify: boolean) {
  if (isDemo()) return demoApi.setStatus(id, status)
  await updateDoc(doc(getDb(), 'cases', id), {
    status,
    updatedAt: serverTimestamp(),
    statusHistory: arrayUnion({ status, at: new Date().toISOString() }),
    notification: notify ? { pending: true, status, requestedAt: new Date().toISOString() } : { pending: false },
  })
}

export async function saveSurveyNotes(id: string, surveyNotes: string) {
  if (isDemo()) return demoApi.update(id, { surveyNotes })
  await updateDoc(doc(getDb(), 'cases', id), { surveyNotes, updatedAt: serverTimestamp() })
}

export function emptyQuote(caseId: string): Quotation {
  return {
    quoteNumber: `Q-${caseId.replace(/^WE-/, '')}`,
    issuedDate: taipeiToday(),
    validDays: 14,
    items: [{ name: '', spec: '', unit: '式', quantity: 1, unitPrice: 0, subtotal: 0 }],
    subtotal: 0, taxIncluded: false, taxAmount: 0, discount: 0, totalAmount: 0,
    paymentTerms: '訂金 40%、配管完成 30%、完工驗收 30%',
    warrantyMonths: 12,
    customNotes: '實際施工以現場暗管可施作狀況為準。',
  }
}

/** Recomputes every derived amount so stored totals can never disagree with the items. */
export function normalizeQuote(q: Quotation): Quotation {
  const items = q.items.map((it) => ({ ...it, subtotal: Math.round(it.quantity * it.unitPrice) }))
  const t = computeTotals(items, q.taxIncluded, q.discount)
  return { ...q, items, subtotal: t.subtotal, discount: t.discount, taxAmount: t.taxAmount, totalAmount: t.totalAmount }
}

export async function saveQuote(id: string, q: Quotation) {
  if (isDemo()) return demoApi.update(id, { quotation: normalizeQuote(q) })
  await updateDoc(doc(getDb(), 'cases', id), { quotation: normalizeQuote(q), updatedAt: serverTimestamp() })
}

export async function listSchedule(from: string, to: string): Promise<Record<string, ScheduleDoc>> {
  if (isDemo()) return demoApi.listSchedule(from, to)
  const snap = await getDocs(query(collection(getDb(), 'schedules'), where('date', '>=', from), where('date', '<=', to)))
  const out: Record<string, ScheduleDoc> = {}
  snap.forEach((d) => { out[d.id] = d.data() as ScheduleDoc })
  return out
}

export async function setDay(date: string, dayStatus: DayStatus, note: string) {
  if (isDemo()) return demoApi.setDay(date, dayStatus, note)
  await setDoc(doc(getDb(), 'schedules', date), { date, dayStatus, note }, { merge: true })
}

export async function getSettings(): Promise<Partial<SystemSettings>> {
  if (isDemo()) return demoApi.getSettings()
  const d = await getDoc(doc(getDb(), 'system_settings/global'))
  return d.exists() ? (d.data() as Partial<SystemSettings>) : {}
}

export async function saveSettings(patch: Partial<SystemSettings>) {
  if (isDemo()) return demoApi.saveSettings(patch)
  await setDoc(doc(getDb(), 'system_settings/global'), patch, { merge: true })
}
