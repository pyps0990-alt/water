import { useId, useState, type FormEvent } from 'react'
import { Camera, CheckCircle2, Loader2, X } from 'lucide-react'
import { Section, btnPrimary, inputCls } from '../components/ui'
import { isFirebaseConfigured } from '../lib/firebase'
import { MAX_PHOTOS, compressPhoto, submitCase } from '../lib/submitCase'
import { BUILDING_LABELS, BUILDING_TYPES, CATEGORIES, CATEGORY_LABELS, type BuildingType, type Category, type Source } from '../types/models'

interface Photo { file: File; url: string }
type Errors = Partial<Record<'name' | 'phone' | 'district' | 'address' | 'description', string>>

const fieldHint = (id: string, err?: string) => (err ? { 'aria-invalid': true, 'aria-describedby': `${id}-err` } : {})

export function SurveyForm({ source, weekFull }: { source: Source; weekFull: boolean }) {
  const uid = useId()
  const [f, setF] = useState({ name: '', phone: '', lineId: '', district: '', address: '', buildingType: 'apartment' as BuildingType,
    category: 'electrical' as Category, description: '', preferredTime: '' })
  const [photos, setPhotos] = useState<Photo[]>([])
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState<{ kind: 'error' | 'ok'; text: string; caseId?: string } | null>(null)

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  async function addPhotos(files: FileList | null) {
    if (!files) return
    const room = MAX_PHOTOS - photos.length
    const picked = Array.from(files).filter((x) => x.type.startsWith('image/')).slice(0, room)
    if (!picked.length) return
    setBusy('壓縮照片中…')
    try {
      const out: Photo[] = []
      for (const file of picked) {
        const c = await compressPhoto(file)
        out.push({ file: c, url: URL.createObjectURL(c) })
      }
      setPhotos((p) => [...p, ...out])
    } catch {
      setMessage({ kind: 'error', text: '照片處理失敗，請換一張照片再試。' })
    } finally {
      setBusy('')
    }
  }

  function removePhoto(i: number) {
    setPhotos((p) => { URL.revokeObjectURL(p[i].url); return p.filter((_, k) => k !== i) })
  }

  function validate(): Errors {
    const e: Errors = {}
    if (!f.name.trim()) e.name = '請填寫姓名或稱呼'
    if (!/^[0-9+\-\s]{8,20}$/.test(f.phone.trim())) e.phone = '請填寫有效的電話號碼'
    if (!f.district.trim()) e.district = '請填寫所在地區'
    if (!f.address.trim()) e.address = '請填寫地址，方便安排場勘'
    if (f.description.trim().length < 5) e.description = '請簡單描述問題（至少 5 個字）'
    return e
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    setMessage(null)
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      document.getElementById(`${uid}-${Object.keys(e)[0]}`)?.focus()
      return
    }
    if (!isFirebaseConfigured) {
      setMessage({ kind: 'error', text: '系統尚未完成設定，暫時無法線上預約，請改用 LINE 或電話聯繫。' })
      return
    }
    try {
      const caseId = await submitCase(
        { source, clientInfo: { name: f.name, phone: f.phone, lineId: f.lineId, district: f.district, address: f.address, buildingType: f.buildingType },
          problemReport: { category: f.category, description: f.description, preferredTime: f.preferredTime } },
        photos.map((p) => p.file), setBusy)
      setMessage({ kind: 'ok', text: '預約已送出！我們會在 1–2 個工作天內與您聯繫安排場勘。', caseId })
      photos.forEach((p) => URL.revokeObjectURL(p.url))
      setPhotos([])
    } catch (err) {
      const msg = (err as { message?: string })?.message
      setMessage({ kind: 'error', text: msg && /[一-鿿]/.test(msg) ? msg : '送出失敗，請稍後再試，或改用 LINE 聯繫。' })
    } finally {
      setBusy('')
    }
  }

  if (message?.kind === 'ok') {
    return (
      <Section id="book" no={5} code="SR" title="預約場勘">
        <div role="status" aria-live="polite" className="sheet border-l-8 border-l-ok p-6">
          <p className="flex items-center gap-2 text-lg font-bold text-ok"><CheckCircle2 aria-hidden className="h-6 w-6" />{message.text}</p>
          <p className="mt-3">您的案件編號：<strong className="text-2xl tracking-wide text-navy">{message.caseId}</strong></p>
          <p className="mt-1 text-ink-muted">請保留案件編號，可搭配電話末三碼在下方查詢進度。</p>
          <button type="button" className="mt-4 font-semibold text-eng-blue underline" onClick={() => setMessage(null)}>再預約一件</button>
        </div>
      </Section>
    )
  }

  const L = (k: string) => `${uid}-${k}`
  return (
    <Section id="book" no={5} code="SR" title="預約場勘" lead="填寫問題與現場照片，我們看過後會聯繫您安排到府場勘。場勘後才報價。">
      {weekFull && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 font-semibold text-busy">本週名額已滿，現在送出將安排於下週場勘。</p>
      )}
      <form noValidate onSubmit={onSubmit} className="sheet grid gap-5 p-5 md:grid-cols-2 md:p-7">
        <div>
          <label htmlFor={L('name')} className="font-semibold">姓名／稱呼 <span className="text-closed">*</span></label>
          <input id={L('name')} className={inputCls} autoComplete="name" value={f.name} onChange={set('name')} {...fieldHint(L('name'), errors.name)} />
          {errors.name && <p id={`${L('name')}-err`} className="mt-1 text-sm text-closed">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor={L('phone')} className="font-semibold">手機 <span className="text-closed">*</span></label>
          <input id={L('phone')} type="tel" inputMode="tel" autoComplete="tel" className={inputCls} value={f.phone} onChange={set('phone')} {...fieldHint(L('phone'), errors.phone)} />
          {errors.phone && <p id={`${L('phone')}-err`} className="mt-1 text-sm text-closed">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor={L('lineId')} className="font-semibold">LINE ID（選填）</label>
          <input id={L('lineId')} className={inputCls} value={f.lineId} onChange={set('lineId')} />
        </div>
        <div>
          <label htmlFor={L('district')} className="font-semibold">地區 <span className="text-closed">*</span></label>
          <input id={L('district')} className={inputCls} placeholder="例：基隆市七堵區" autoComplete="address-level2" value={f.district} onChange={set('district')} {...fieldHint(L('district'), errors.district)} />
          {errors.district && <p id={`${L('district')}-err`} className="mt-1 text-sm text-closed">{errors.district}</p>}
        </div>
        <div className="md:col-span-2">
          <label htmlFor={L('address')} className="font-semibold">地址 <span className="text-closed">*</span></label>
          <input id={L('address')} className={inputCls} autoComplete="street-address" value={f.address} onChange={set('address')} {...fieldHint(L('address'), errors.address)} />
          {errors.address && <p id={`${L('address')}-err`} className="mt-1 text-sm text-closed">{errors.address}</p>}
          <p className="mt-1 text-sm text-ink-muted">地址只供安排場勘使用，不會公開。</p>
        </div>

        <fieldset className="md:col-span-2">
          <legend className="font-semibold">建物類型</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
            {BUILDING_TYPES.map((b) => (
              <label key={b} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-sm border-[1.5px] border-slate-500 px-3 has-[:checked]:border-navy has-[:checked]:bg-navy has-[:checked]:text-white">
                <input type="radio" name="buildingType" value={b} checked={f.buildingType === b} onChange={set('buildingType')} className="h-5 w-5 accent-eng-blue" />
                {BUILDING_LABELS[b]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="md:col-span-2">
          <label htmlFor={L('category')} className="font-semibold">問題類別</label>
          <select id={L('category')} className={inputCls} value={f.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor={L('description')} className="font-semibold">問題描述 <span className="text-closed">*</span></label>
          <textarea id={L('description')} rows={4} className={inputCls} placeholder="例：開冷氣加電鍋就跳電，總開關箱是 30 年前的。" value={f.description} onChange={set('description')} {...fieldHint(L('description'), errors.description)} />
          {errors.description && <p id={`${L('description')}-err`} className="mt-1 text-sm text-closed">{errors.description}</p>}
        </div>
        <div className="md:col-span-2">
          <label htmlFor={L('preferredTime')} className="font-semibold">方便場勘的時段（選填）</label>
          <input id={L('preferredTime')} className={inputCls} placeholder="例：平日下午 2 點後" value={f.preferredTime} onChange={set('preferredTime')} />
        </div>

        <div className="md:col-span-2">
          <p className="font-semibold">現場照片（最多 {MAX_PHOTOS} 張，選填）</p>
          <p className="text-sm text-ink-muted">拍下問題位置、開關箱、管線等，照片會自動壓縮後上傳。</p>
          <ul className="mt-2 flex flex-wrap gap-2" aria-label="已選照片">
            {photos.map((p, i) => (
              <li key={p.url} className="relative">
                <img src={p.url} alt={`現場照片 ${i + 1}`} className="h-24 w-24 rounded-sm border-[1.5px] border-navy object-cover" />
                <button type="button" onClick={() => removePhoto(i)} aria-label={`移除照片 ${i + 1}`}
                  className="absolute -right-2 -top-2 inline-flex h-11 w-11 items-center justify-center">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-navy text-white"><X aria-hidden className="h-4 w-4" /></span>
                </button>
              </li>
            ))}
            {photos.length < MAX_PHOTOS && (
              <li>
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed border-eng-blue text-sm font-semibold text-eng-blue focus-within:ring-2 focus-within:ring-eng-blue">
                  <Camera aria-hidden className="h-6 w-6" />新增照片
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { addPhotos(e.target.files); e.target.value = '' }} />
                </label>
              </li>
            )}
          </ul>
        </div>

        <div className="md:col-span-2">
          <div aria-live="polite" className="min-h-6">
            {busy && <p className="flex items-center gap-2 text-ink-muted"><Loader2 aria-hidden className="h-4 w-4 animate-spin" />{busy}</p>}
            {message?.kind === 'error' && <p role="alert" className="font-semibold text-closed">{message.text}</p>}
          </div>
          <button type="submit" disabled={!!busy} className={`${btnPrimary} mt-2 w-full md:w-auto`}>送出場勘預約</button>
        </div>
      </form>
    </Section>
  )
}
