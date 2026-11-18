import { useState, type FormEvent } from 'react'
import { Section, btnPrimary, inputCls } from '../components/ui'
import { StatusStepper } from '../components/StatusStepper'
import { isFirebaseConfigured } from '../lib/firebase'
import { CATEGORY_LABELS, STATUS_LABELS, type CaseStatus, type Category } from '../types/models'

interface Result { caseId: string; status: CaseStatus; category: Category; updatedAt: string | null }

export function StatusLookup() {
  const [caseId, setCaseId] = useState('')
  const [last3, setLast3] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(''); setResult(null)
    const id = caseId.trim().toUpperCase()
    if (!/^WE-\d{8}-\d{2,3}$/.test(id)) return setError('案件編號格式為 WE-YYYYMMDD-NN，例如 WE-20261118-01')
    if (!/^\d{3}$/.test(last3)) return setError('請輸入電話號碼最後 3 碼')
    if (!isFirebaseConfigured) return setError('系統尚未完成設定，暫時無法查詢。')
    setBusy(true)
    try {
      const { callFn } = await import('../lib/firebaseExtras')
      setResult(await callFn<unknown, Result>('getCaseStatus', { caseId: id, phoneLast3: last3 }))
    } catch (err) {
      const msg = (err as { message?: string })?.message
      setError(msg && /[一-鿿]/.test(msg) ? msg : '查詢失敗，請稍後再試。')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section id="status" title="案件進度查詢" lead="輸入案件編號與電話末三碼，即可查看目前進度。">
      <form onSubmit={onSubmit} noValidate className="grid gap-4 rounded-xl bg-surface p-5 shadow-sm sm:grid-cols-[2fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="q-case" className="font-semibold">案件編號</label>
          <input id="q-case" className={`${inputCls} uppercase`} placeholder="WE-20261118-01" autoCapitalize="characters" value={caseId} onChange={(e) => setCaseId(e.target.value)} />
        </div>
        <div>
          <label htmlFor="q-last3" className="font-semibold">電話末三碼</label>
          <input id="q-last3" className={inputCls} inputMode="numeric" maxLength={3} value={last3} onChange={(e) => setLast3(e.target.value.replace(/\D/g, ''))} />
        </div>
        <button type="submit" disabled={busy} className={btnPrimary}>{busy ? '查詢中…' : '查詢'}</button>
      </form>
      <div aria-live="polite" className="mt-4">
        {error && <p role="alert" className="font-semibold text-closed">{error}</p>}
        {result && (
          <div className="rounded-xl bg-surface p-5 shadow-sm">
            <p><strong>{result.caseId}</strong>・{CATEGORY_LABELS[result.category]}</p>
            <p className="mb-3 text-lg">目前狀態：<strong className="text-eng-blue">{STATUS_LABELS[result.status]}</strong></p>
            <StatusStepper status={result.status} />
            {result.updatedAt && <p className="mt-3 text-sm text-ink-muted">最後更新：{new Date(result.updatedAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}</p>}
          </div>
        )}
      </div>
    </Section>
  )
}
