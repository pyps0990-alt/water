/**
 * Admin demo mode: a self-contained in-browser data store with fictional sample data,
 * so the dashboard can be explored without Firebase. Nothing leaves the browser tab.
 */
import { addDays, taipeiToday } from '../lib/dates'
import type { CaseDoc, CaseStatus, DayStatus, Quotation, ScheduleDoc, SystemSettings } from '../types/models'

const FLAG = 'admin_demo'
const KEY = 'admin_demo_store_v1'

export function isDemo(): boolean {
  try { return sessionStorage.getItem(FLAG) === '1' } catch { return memFlag }
}
let memFlag = false
export function enterDemo() { memFlag = true; try { sessionStorage.setItem(FLAG, '1') } catch { /* ignore */ } }
export function exitDemo() { memFlag = false; try { sessionStorage.removeItem(FLAG); sessionStorage.removeItem(KEY) } catch { /* ignore */ } }

type StoredCase = Omit<CaseDoc, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string; statusHistory?: unknown[] }
interface Store { cases: StoredCase[]; schedules: Record<string, ScheduleDoc>; settings: Partial<SystemSettings> }

/** Simple illustrative "site photo" as an SVG data URL. */
function photo(label: string, hue: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},35%,30%)"/><stop offset="1" stop-color="hsl(${hue},40%,14%)"/></linearGradient></defs>
<rect width="800" height="600" fill="url(#g)"/>
<g stroke="hsl(${hue},60%,70%)" stroke-width="10" fill="none" opacity=".75"><path d="M60 420 H360 V160 H740"/><path d="M60 480 H500 V300 H740" stroke="#F59E0B"/></g>
<rect x="300" y="220" width="200" height="150" rx="10" fill="#0F172A" stroke="#94A3B8" stroke-width="6"/>
<text x="400" y="560" fill="#E2E8F0" font-family="sans-serif" font-size="34" text-anchor="middle">示範照片：${label}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function seed(): Store {
  const today = taipeiToday()
  const ymd = today.replace(/-/g, '')
  const at = (daysAgo: number, h = 10) => new Date(Date.now() - daysAgo * 864e5 - h * 36e5).toISOString()
  const base = (n: number, status: CaseStatus, source: CaseDoc['source'], name: string, phone: string, district: string, address: string,
    buildingType: CaseDoc['clientInfo']['buildingType'], category: CaseDoc['problemReport']['category'], description: string, photos: string[], daysAgo: number): StoredCase => ({
    caseId: `WE-${ymd}-${String(n).padStart(2, '0')}`, status, source,
    clientInfo: { name, phone, lineId: '', district, address, buildingType },
    problemReport: { category, description, photoPaths: photos, preferredTime: '平日下午 2 點後' },
    surveyNotes: '', quotation: null, createdAt: at(daysAgo), updatedAt: at(daysAgo),
  })
  const quote: Quotation = {
    quoteNumber: `Q-${ymd}-03`, issuedDate: today, validDays: 14,
    items: [
      { name: '全室重新配線（含工帶料）', spec: '太平洋 2.0／5.5mm²', unit: '式', quantity: 1, unitPrice: 48000, subtotal: 48000 },
      { name: '總開關箱更換', spec: '士林電機 NFB', unit: '組', quantity: 1, unitPrice: 12500, subtotal: 12500 },
      { name: '冷氣專用迴路', spec: '220V 5.5mm²', unit: '迴', quantity: 3, unitPrice: 3800, subtotal: 11400 },
    ],
    subtotal: 71900, taxIncluded: true, taxAmount: 3545, discount: 1000, totalAmount: 74445,
    paymentTerms: '訂金 40%、配管完成 30%、完工驗收 30%', warrantyMonths: 12, customNotes: '實際施工以現場暗管可施作狀況為準。',
  }
  const cases = [
    base(1, 'arranging', 'line', '示範・林先生', '0900000101', '基隆市七堵區', '示範路 1 號', 'townhouse', 'electrical', '開冷氣加電鍋就跳電，總開關箱是 30 年前的。', [photo('開關箱', 220), photo('插座焦痕', 20)], 0),
    base(2, 'arranging', 'ig', '示範・陳太太', '0900000202', '台北市信義區', '示範街 22 號 5 樓', 'apartment', 'plumbing', '浴室天花板滲水，樓上說不是他們。', [photo('天花板水痕', 200)], 0),
    base(3, 'pending_survey', 'google_business', '示範・張老闆', '0900000303', '基隆市仁愛區', '示範路 88 號', 'storefront', 'fixtures', '店面要換 20 盞崁燈和 2 台排風扇。', [], 1),
    { ...base(4, 'quoting', 'direct', '示範・黃小姐', '0900000404', '新北市汐止區', '示範大道 6 號', 'apartment', 'electrical', '老屋翻修，要重新配線並加冷氣迴路。', [photo('舊線路', 30), photo('配電盤', 210), photo('廚房', 45)], 2),
      surveyNotes: '30 年老線 2.0mm，總開關箱需換，廚房迴路過載。', quotation: quote },
    base(5, 'in_progress', 'threads', '示範・吳先生', '0900000505', '基隆市安樂區', '示範巷 3 號', 'townhouse', 'plumbing', '鐵管生鏽出黃水，想全部換不鏽鋼管。', [], 6),
    base(6, 'unpaid', 'fb', '示範・李媽媽', '0900000606', '台北市南港區', '示範路 120 號', 'apartment', 'fixtures', '馬桶和面盆更換。', [], 12),
    base(7, 'final_paid', 'google_business', '示範・周先生', '0900000707', '基隆市中正區', '示範路 9 號', 'office_factory', 'weak_current', '辦公室網路線與監視器管線。', [], 25),
  ]
  const schedules: Record<string, ScheduleDoc> = {}
  for (let i = 0; i < 30; i++) {
    const d = addDays(today, i)
    const wd = new Date(`${d}T00:00:00Z`).getUTCDay()
    schedules[d] = { date: d, dayStatus: wd === 0 ? 'closed' : i < 3 ? 'busy' : 'available', bookedCount: i < 2 ? 1 : 0, note: wd === 0 ? '週日公休' : '' }
  }
  return { cases, schedules, settings: { maxWeeklyCases: 5, companyInfo: { name: '示範水電工作室', taxId: '00000000', phone: '02-0000-0000', address: '基隆／台北服務據點', bankAccount: '（示範）000-0000000000', lineOfficialUrl: '' } } }
}

let mem: Store | null = null
function load(): Store {
  if (mem) return mem
  try { const raw = sessionStorage.getItem(KEY); if (raw) return (mem = JSON.parse(raw)) } catch { /* ignore */ }
  return (mem = seed())
}
function persist() { try { sessionStorage.setItem(KEY, JSON.stringify(mem)) } catch { /* ignore */ } }

const ts = (iso: string) => ({ toDate: () => new Date(iso) }) as unknown as CaseDoc['createdAt']
const toRow = (c: StoredCase) => ({ ...c, id: c.caseId, createdAt: ts(c.createdAt), updatedAt: ts(c.updatedAt) }) as CaseDoc & { id: string }
const delay = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 180))

export const demoApi = {
  listCases: () => delay([...load().cases].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(toRow)),
  getCase: (id: string) => delay(load().cases.find((c) => c.caseId === id)).then((c) => (c ? toRow(c) : null)),
  update(id: string, patch: Partial<StoredCase>) {
    const s = load(); const c = s.cases.find((x) => x.caseId === id)
    if (c) Object.assign(c, patch, { updatedAt: new Date().toISOString() })
    persist(); return delay(undefined)
  },
  setStatus(id: string, status: CaseStatus) {
    const c = load().cases.find((x) => x.caseId === id)
    return demoApi.update(id, { status, statusHistory: [...(c?.statusHistory ?? []), { status, at: new Date().toISOString() }] })
  },
  listSchedule: (from: string, to: string) => delay(Object.fromEntries(Object.entries(load().schedules).filter(([d]) => d >= from && d <= to))),
  setDay(date: string, dayStatus: DayStatus, note: string) {
    const s = load(); s.schedules[date] = { ...(s.schedules[date] ?? { bookedCount: 0 }), date, dayStatus, note }; persist(); return delay(undefined)
  },
  getSettings: () => delay(load().settings),
  saveSettings(patch: Partial<SystemSettings>) { const s = load(); s.settings = { ...s.settings, ...patch }; persist(); return delay(undefined) },
}

export function fileToDataUrl(f: Blob): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(f) })
}
