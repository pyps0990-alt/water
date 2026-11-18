import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight, MapPin, MessageCircle, Phone, X, ZoomIn } from 'lucide-react'
import { BUILDING_LABELS, CASE_STATUSES, CATEGORY_LABELS, STATUS_LABELS, type CaseStatus } from '../types/models'
import { btnPrimary, btnSecondary, inputCls } from '../components/ui'
import { StatusStepper } from '../components/StatusStepper'
import { fileUrl } from '../lib/firebaseExtras'
import { getCase, saveSurveyNotes, setStatus, type CaseRow } from './api'
import { Card, PageTitle, SOURCE_LABELS, StatusBadge, fmtTime } from './shared'
import { QuoteEditor } from './QuoteEditor'

export function CaseDetail() {
  const { id = '' } = useParams()
  const [c, setC] = useState<CaseRow | null | undefined>(undefined)
  const reload = () => getCase(id).then(setC).catch(() => setC(null))
  useEffect(() => { reload() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (c === undefined) return <div className="grid gap-4"><p role="status" className="sr-only">載入中…</p><div className="skeleton h-9 w-72" /><div className="skeleton h-40 w-full" /><div className="skeleton h-40 w-full" /></div>
  if (c === null) return <p role="alert">找不到案件 {id}。<Link to="/admin" className="underline">回列表</Link></p>

  const ci = c.clientInfo
  const tel = ci.phone.replace(/[^\d+]/g, '')
  return (
    <div className="grid gap-4">
      <Link viewTransition to="/admin" className="inline-flex min-h-11 items-center gap-1 font-bold text-eng-blue"><ArrowLeft aria-hidden className="h-4 w-4" />案件列表</Link>
      <PageTitle code="02" title={<span className="font-mono">{c.caseId}</span>}>
        <StatusBadge status={c.status} />
      </PageTitle>
      <p className="-mt-2 font-mono text-sm text-ink-muted">來源 {SOURCE_LABELS[c.source]}・建立 {fmtTime(c.createdAt)}</p>

      <StatusControl c={c} onChanged={reload} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-black">客戶</h2>
          <p className="mt-1 text-xl font-bold">{ci.name}</p>
          <p className="text-ink-muted">{BUILDING_LABELS[ci.buildingType]}・{ci.district}</p>
          <p>{ci.address}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={`tel:${tel}`} className={btnSecondary}><Phone aria-hidden className="h-4 w-4" />{ci.phone}</a>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${ci.district}${ci.address}`)}`} target="_blank" rel="noreferrer" className={btnSecondary}>
              <MapPin aria-hidden className="h-4 w-4" />地圖
            </a>
            {ci.lineId && <span className="inline-flex min-h-11 items-center gap-1 px-2 font-mono"><MessageCircle aria-hidden className="h-4 w-4" />LINE {ci.lineId}</span>}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-black">問題回報・{CATEGORY_LABELS[c.problemReport.category]}</h2>
          <p className="mt-1 whitespace-pre-wrap">{c.problemReport.description}</p>
          {c.problemReport.preferredTime && <p className="mt-2 text-ink-muted">方便時段：{c.problemReport.preferredTime}</p>}
          <Photos paths={c.problemReport.photoPaths ?? []} />
        </Card>
      </div>

      <NotesEditor id={c.id} initial={c.surveyNotes ?? ''} />
      <QuoteEditor c={c} onSaved={reload} />
    </div>
  )
}

function StatusControl({ c, onChanged }: { c: CaseRow; onChanged: () => void }) {
  const dlg = useRef<HTMLDialogElement>(null)
  const [target, setTarget] = useState<CaseStatus>(c.status)
  const [notify, setNotify] = useState(true)
  const [busy, setBusy] = useState(false)
  const idx = CASE_STATUSES.indexOf(c.status)
  const next = CASE_STATUSES[idx + 1]

  const open = (s: CaseStatus) => { setTarget(s); setNotify(true); dlg.current?.showModal() }
  const confirm = async () => {
    setBusy(true)
    try { await setStatus(c.id, target, notify); dlg.current?.close(); onChanged() } finally { setBusy(false) }
  }

  return (
    <Card>
      <StatusStepper status={c.status} />
      <div className="mt-4 flex flex-wrap gap-2">
        {next && <button className={btnPrimary} onClick={() => open(next)}>推進到「{STATUS_LABELS[next]}」<ChevronRight aria-hidden className="h-4 w-4" /></button>}
        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm font-bold">或改為</span>
          <select className={`${inputCls} mt-0 w-auto`} value="" onChange={(e) => e.target.value && open(e.target.value as CaseStatus)}>
            <option value="">選擇狀態…</option>
            {CASE_STATUSES.filter((s) => s !== c.status).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </label>
      </div>
      <dialog ref={dlg} aria-labelledby="st-title" className="dlg m-auto w-[min(26rem,92vw)] overflow-hidden rounded-sm border-[1.5px] border-navy p-0 shadow-[0_30px_80px_-20px_rgb(15_23_42/0.6)] backdrop:bg-ink-900/70 backdrop:backdrop-blur-sm">
        <div aria-hidden className="copper-rule" />
        <div className="p-5">
          <h2 id="st-title" className="text-lg font-black">確認變更狀態</h2>
          <p className="mt-2">{STATUS_LABELS[c.status]} → <strong>{STATUS_LABELS[target]}</strong></p>
          <label className="mt-4 flex min-h-11 items-center gap-2">
            <input type="checkbox" className="h-5 w-5 accent-eng-blue" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            同時通知客戶（LINE／Email）
          </label>
          <p className="text-sm text-ink-muted">通知功能將在第 4 階段串接後生效。</p>
          <div className="mt-5 flex justify-end gap-2">
            <button className={btnSecondary} onClick={() => dlg.current?.close()}>取消</button>
            <button className={btnPrimary} disabled={busy} onClick={confirm}>{busy ? '更新中…' : '確認變更'}</button>
          </div>
        </div>
      </dialog>
    </Card>
  )
}

function Photos({ paths }: { paths: string[] }) {
  const [urls, setUrls] = useState<string[]>([])
  const [open, setOpen] = useState<number | null>(null)
  const [zoom, setZoom] = useState(false)
  const dlg = useRef<HTMLDialogElement>(null)
  useEffect(() => { Promise.all(paths.map((p) => fileUrl(p).catch(() => ''))).then(setUrls) }, [paths])
  useEffect(() => { if (open !== null) { setZoom(false); dlg.current?.showModal() } }, [open])

  if (!paths.length) return <p className="mt-3 text-ink-muted">客戶未上傳照片。</p>
  return (
    <>
      <ul className="mt-3 flex flex-wrap gap-2" aria-label="現場照片">
        {urls.map((u, i) => (
          <li key={i}>
            <button onClick={() => setOpen(i)} className="relative block" aria-label={`放大現場照片 ${i + 1}`}>
              {u ? <img src={u} alt="" className="h-24 w-24 border-[1.5px] border-navy object-cover" /> : <span className="flex h-24 w-24 items-center justify-center bg-slate-200 text-sm">讀取失敗</span>}
              <ZoomIn aria-hidden className="absolute bottom-1 right-1 h-5 w-5 rounded-sm bg-navy/80 p-0.5 text-white" />
            </button>
          </li>
        ))}
      </ul>
      <dialog ref={dlg} onClose={() => setOpen(null)} aria-label="照片檢視" className="m-0 h-full max-h-none w-full max-w-none bg-navy p-0 backdrop:bg-navy">
        {open !== null && (
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 p-2 text-white">
              <span className="font-mono">{open + 1} / {urls.length}</span>
              <button className="ml-auto inline-flex min-h-11 items-center px-3 font-bold" onClick={() => setZoom((z) => !z)} aria-pressed={zoom}>{zoom ? '縮小' : '放大 2×'}</button>
              <button className="inline-flex h-11 w-11 items-center justify-center" onClick={() => dlg.current?.close()} aria-label="關閉"><X aria-hidden className="h-6 w-6" /></button>
            </div>
            <div className="flex-1 overflow-auto">
              <img src={urls[open]} alt={`現場照片 ${open + 1}`} className={zoom ? 'max-w-none' : 'mx-auto h-full w-full object-contain'} style={zoom ? { width: '200%' } : undefined} />
            </div>
            <div className="flex justify-between p-2">
              <button className="inline-flex min-h-11 items-center px-4 font-bold text-white disabled:opacity-40" disabled={open === 0} onClick={() => setOpen(open - 1)}>上一張</button>
              <button className="inline-flex min-h-11 items-center px-4 font-bold text-white disabled:opacity-40" disabled={open === urls.length - 1} onClick={() => setOpen(open + 1)}>下一張</button>
            </div>
          </div>
        )}
      </dialog>
    </>
  )
}

function NotesEditor({ id, initial }: { id: string; initial: string }) {
  const [v, setV] = useState(initial)
  const [saved, setSaved] = useState(initial)
  const [msg, setMsg] = useState('')
  const dirty = v !== saved
  return (
    <Card>
      <label htmlFor="notes" className="text-lg font-black">場勘筆記（僅內部可見）</label>
      <textarea id="notes" rows={5} className={inputCls} value={v} onChange={(e) => { setV(e.target.value); setMsg('') }}
        placeholder="例：30 年老線 2.0mm，總開關箱需換，廚房迴路過載。" />
      <div className="mt-2 flex items-center gap-3">
        <button className={btnPrimary} disabled={!dirty} onClick={() => saveSurveyNotes(id, v).then(() => { setSaved(v); setMsg('已儲存') }).catch((e) => setMsg(`儲存失敗：${e.message}`))}>儲存筆記</button>
        <span aria-live="polite" className="text-sm">{msg}</span>
      </div>
    </Card>
  )
}
