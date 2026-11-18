import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowUp, Plus, Printer, Trash2 } from 'lucide-react'
import { btnAccent, btnPrimary, btnSecondary, inputCls } from '../components/ui'
import { computeTotals, ntd } from '../lib/quote'
import type { QuoteItem, Quotation } from '../types/models'
import { emptyQuote, saveQuote, type CaseRow } from './api'
import { Card } from './shared'

/** Rough print limits for the 2-line clamped cells on the A4 sheet. */
export const NAME_MAX = 38
export const SPEC_MAX = 18
const UNITS = ['式', '組', '只', '迴', '米', '處', '台', '個', '坪']

export function QuoteEditor({ c, onSaved }: { c: CaseRow; onSaved: () => void }) {
  const nav = useNavigate()
  const [q, setQ] = useState<Quotation>(() => c.quotation ?? emptyQuote(c.caseId))
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const totals = useMemo(() => computeTotals(q.items, q.taxIncluded, q.discount), [q])

  const setItem = (i: number, patch: Partial<QuoteItem>) => setQ({ ...q, items: q.items.map((it, k) => (k === i ? { ...it, ...patch } : it)) })
  const move = (i: number, d: -1 | 1) => {
    const items = [...q.items]; const j = i + d
    if (j < 0 || j >= items.length) return
    ;[items[i], items[j]] = [items[j], items[i]]
    setQ({ ...q, items })
  }
  const problems = q.items.flatMap((it, i) => [
    !it.name.trim() && `第 ${i + 1} 項缺少項目名稱`,
    !(it.quantity > 0) && `第 ${i + 1} 項數量需大於 0`,
    !(it.unitPrice >= 0) && `第 ${i + 1} 項單價不可為負`,
  ].filter(Boolean) as string[])

  async function save(thenPrint = false) {
    setMsg('')
    if (!q.items.length) return setMsg('請至少新增一個項目')
    if (problems.length) return setMsg(problems[0])
    setBusy(true)
    try {
      await saveQuote(c.id, q)
      setMsg('報價已儲存')
      onSaved()
      if (thenPrint) nav(`/admin/print/${c.id}`)
    } catch (e) {
      setMsg(`儲存失敗：${(e as Error).message}`)
    } finally { setBusy(false) }
  }

  const num = (v: string) => (v === '' ? 0 : Number(v))
  return (
    <Card>
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="text-lg font-black">報價單</h2>
        <span className="font-mono text-sm text-ink-muted">{q.quoteNumber}</span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="block text-sm font-bold">報價日期
          <input type="date" className={inputCls} value={q.issuedDate} onChange={(e) => setQ({ ...q, issuedDate: e.target.value })} />
        </label>
        <fieldset>
          <legend className="text-sm font-bold">有效期限</legend>
          <div className="mt-1 flex gap-2">
            {([7, 14] as const).map((d) => (
              <label key={d} className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-sm border-[1.5px] border-slate-500 has-[:checked]:border-navy has-[:checked]:bg-navy has-[:checked]:text-white">
                <input type="radio" name="validDays" className="sr-only" checked={q.validDays === d} onChange={() => setQ({ ...q, validDays: d })} />{d} 天
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block text-sm font-bold">保固（月）
          <input type="number" inputMode="numeric" min={0} className={inputCls} value={q.warrantyMonths} onChange={(e) => setQ({ ...q, warrantyMonths: num(e.target.value) })} />
        </label>
      </div>

      <ol className="mt-5 grid gap-3" aria-label="報價項目">
        {q.items.map((it, i) => {
          const sub = Math.round(it.quantity * it.unitPrice)
          return (
            <li key={i} className="border-[1.5px] border-slate-400 bg-canvas p-3">
              <div className="flex items-center gap-1">
                <span className="font-mono text-sm font-bold text-eng-blue">#{String(i + 1).padStart(2, '0')}</span>
                <span className="ml-auto font-mono font-bold">{ntd(sub)}</span>
                <button className="inline-flex h-11 w-11 items-center justify-center disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`第 ${i + 1} 項上移`}><ArrowUp aria-hidden className="h-4 w-4" /></button>
                <button className="inline-flex h-11 w-11 items-center justify-center disabled:opacity-30" disabled={i === q.items.length - 1} onClick={() => move(i, 1)} aria-label={`第 ${i + 1} 項下移`}><ArrowDown aria-hidden className="h-4 w-4" /></button>
                <button className="inline-flex h-11 w-11 items-center justify-center text-closed" onClick={() => setQ({ ...q, items: q.items.filter((_, k) => k !== i) })} aria-label={`刪除第 ${i + 1} 項`}><Trash2 aria-hidden className="h-4 w-4" /></button>
              </div>
              <div className="grid gap-2 sm:grid-cols-[2fr_1.3fr]">
                <label className="block text-sm font-bold">項目名稱
                  <input className={inputCls} value={it.name} onChange={(e) => setItem(i, { name: e.target.value })} />
                  {it.name.length > NAME_MAX && <span className="text-xs font-bold text-busy">超過 {NAME_MAX} 字，列印時可能被截斷</span>}
                </label>
                <label className="block text-sm font-bold">規格／品牌
                  <input className={inputCls} value={it.spec} onChange={(e) => setItem(i, { spec: e.target.value })} />
                  {it.spec.length > SPEC_MAX && <span className="text-xs font-bold text-busy">超過 {SPEC_MAX} 字，列印時可能被截斷</span>}
                </label>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <label className="block text-sm font-bold">單位
                  <input className={inputCls} list="units" value={it.unit} onChange={(e) => setItem(i, { unit: e.target.value })} />
                </label>
                <label className="block text-sm font-bold">數量
                  <input type="number" inputMode="decimal" min={0} step="any" className={`${inputCls} font-mono`} value={it.quantity} onChange={(e) => setItem(i, { quantity: num(e.target.value) })} />
                </label>
                <label className="block text-sm font-bold">單價
                  <input type="number" inputMode="numeric" min={0} className={`${inputCls} font-mono`} value={it.unitPrice} onChange={(e) => setItem(i, { unitPrice: num(e.target.value) })} />
                </label>
              </div>
            </li>
          )
        })}
      </ol>
      <datalist id="units">{UNITS.map((u) => <option key={u} value={u} />)}</datalist>
      <button className={`${btnSecondary} mt-3 w-full sm:w-auto`} onClick={() => setQ({ ...q, items: [...q.items, { name: '', spec: '', unit: '式', quantity: 1, unitPrice: 0, subtotal: 0 }] })}>
        <Plus aria-hidden className="h-4 w-4" />新增項目
      </button>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="grid gap-3">
          <label className="flex min-h-11 items-center gap-2 font-bold">
            <input type="checkbox" className="h-5 w-5 accent-eng-blue" checked={q.taxIncluded} onChange={(e) => setQ({ ...q, taxIncluded: e.target.checked })} />
            外加 5% 營業稅（開立發票）
          </label>
          <label className="block text-sm font-bold">折讓金額
            <input type="number" inputMode="numeric" min={0} className={`${inputCls} font-mono`} value={q.discount} onChange={(e) => setQ({ ...q, discount: num(e.target.value) })} />
          </label>
          <label className="block text-sm font-bold">付款條件
            <input className={inputCls} value={q.paymentTerms} onChange={(e) => setQ({ ...q, paymentTerms: e.target.value })} />
          </label>
          <label className="block text-sm font-bold">備註
            <textarea rows={2} className={inputCls} value={q.customNotes} onChange={(e) => setQ({ ...q, customNotes: e.target.value })} />
          </label>
        </div>
        <dl className="self-start border-[1.5px] border-navy bg-surface p-4 font-mono" aria-label="金額試算">
          <div className="flex justify-between py-1"><dt>小計</dt><dd>{ntd(totals.subtotal)}</dd></div>
          <div className="flex justify-between py-1"><dt>折讓</dt><dd>− {ntd(totals.discount)}</dd></div>
          <div className="flex justify-between py-1"><dt>營業稅 5%</dt><dd>{q.taxIncluded ? ntd(totals.taxAmount) : '未稅'}</dd></div>
          <div className="mt-1 flex justify-between border-t-2 border-navy pt-2 text-lg font-bold"><dt>總計</dt><dd data-testid="quote-total">{ntd(totals.totalAmount)}</dd></div>
        </dl>
      </div>

      <div className="sticky bottom-16 z-20 -mx-4 mt-5 flex flex-wrap items-center gap-2 border-t-2 border-navy bg-surface/95 px-4 py-3 md:bottom-0">
        <button className={btnPrimary} disabled={busy} onClick={() => save(false)}>儲存報價</button>
        <button className={btnAccent} disabled={busy} onClick={() => save(true)}><Printer aria-hidden className="h-4 w-4" />儲存並列印 A4</button>
        <span aria-live="polite" className={`text-sm font-bold ${msg.startsWith('報價已') ? 'text-ok' : 'text-closed'}`}>{msg}</span>
      </div>
    </Card>
  )
}
