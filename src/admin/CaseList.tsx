import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Columns3, List, RefreshCw, Search } from 'lucide-react'
import { CASE_STATUSES, CATEGORY_LABELS, SOURCES, STATUS_LABELS, type CaseStatus, type Source } from '../types/models'
import { inputCls } from '../components/ui'
import { listCases, type CaseRow } from './api'
import { SOURCE_LABELS, STATUS_ICON, StatusBadge, fmtTime } from './shared'

export function CaseList() {
  const [rows, setRows] = useState<CaseRow[] | null>(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<CaseStatus | 'all'>('all')
  const [source, setSource] = useState<Source | 'all'>('all')
  const [q, setQ] = useState('')
  const [view, setView] = useState<'list' | 'board'>(() => (window.innerWidth >= 1024 ? 'board' : 'list'))

  const load = () => { setError(''); listCases().then(setRows).catch((e) => setError(e.message)) }
  useEffect(load, [])

  const filtered = useMemo(() => (rows ?? []).filter((r) =>
    (source === 'all' || r.source === source) &&
    (!q.trim() || [r.caseId, r.clientInfo.name, r.clientInfo.phone, r.clientInfo.district].some((v) => v?.toLowerCase().includes(q.trim().toLowerCase())))
  ), [rows, source, q])

  const counts = useMemo(() => Object.fromEntries(CASE_STATUSES.map((s) => [s, filtered.filter((r) => r.status === s).length])), [filtered])
  const shown = status === 'all' ? filtered : filtered.filter((r) => r.status === status)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-2xl font-black">案件</h1>
        <button onClick={load} className="inline-flex min-h-11 items-center gap-1 px-2 font-bold text-eng-blue"><RefreshCw aria-hidden className="h-4 w-4" />重新整理</button>
        <div role="group" aria-label="檢視方式" className="flex border-[1.5px] border-navy">
          {([['list', '列表', List], ['board', '看板', Columns3]] as const).map(([v, label, Icon]) => (
            <button key={v} aria-pressed={view === v} onClick={() => setView(v)}
              className={`inline-flex min-h-11 items-center gap-1 px-3 font-bold ${view === v ? 'bg-navy text-white' : 'bg-surface'}`}>
              <Icon aria-hidden className="h-4 w-4" />{label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_12rem]">
        <label className="relative block">
          <span className="sr-only">搜尋案件</span>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 mt-0.5 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input className={`${inputCls} pl-9`} placeholder="搜尋編號、姓名、電話、地區" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <label className="block">
          <span className="sr-only">來源</span>
          <select className={inputCls} value={source} onChange={(e) => setSource(e.target.value as Source | 'all')}>
            <option value="all">全部來源</option>
            {SOURCES.map((s) => <option key={s} value={s}>{SOURCE_LABELS[s]}</option>)}
          </select>
        </label>
      </div>

      {view === 'list' && (
        <div role="group" aria-label="依狀態篩選" className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {(['all', ...CASE_STATUSES] as const).map((s) => (
            <button key={s} aria-pressed={status === s} onClick={() => setStatus(s)}
              className={`inline-flex min-h-11 shrink-0 items-center gap-1 rounded-sm border-[1.5px] px-3 font-bold ${status === s ? 'border-navy bg-navy text-white' : 'border-slate-400 bg-surface'}`}>
              {s === 'all' ? `全部 ${filtered.length}` : `${STATUS_LABELS[s]} ${counts[s]}`}
            </button>
          ))}
        </div>
      )}

      <div aria-live="polite" className="mt-4">
        {error && <p role="alert" className="font-bold text-closed">讀取失敗：{error}</p>}
        {!rows && !error && <p role="status">載入中…</p>}
        {rows && view === 'list' && (
          shown.length ? <ul className="grid gap-3">{shown.map((r) => <li key={r.id}><CaseCard r={r} /></li>)}</ul>
            : <p className="text-ink-muted">沒有符合的案件。</p>
        )}
        {rows && view === 'board' && (
          <div className="grid gap-3 overflow-x-auto pb-2 [grid-template-columns:repeat(6,minmax(15rem,1fr))]">
            {CASE_STATUSES.map((s) => {
              const Icon = STATUS_ICON[s]
              const col = filtered.filter((r) => r.status === s)
              return (
                <section key={s} aria-label={`${STATUS_LABELS[s]}（${col.length}）`} className="border-[1.5px] border-slate-400 bg-slate-100/80 p-2">
                  <h2 className="mb-2 flex items-center gap-1 font-black"><Icon aria-hidden className="h-4 w-4" />{STATUS_LABELS[s]}<span className="ml-auto font-mono text-sm">{col.length}</span></h2>
                  <ul className="grid gap-2">{col.map((r) => <li key={r.id}><CaseCard r={r} compact /></li>)}</ul>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function CaseCard({ r, compact = false }: { r: CaseRow; compact?: boolean }) {
  return (
    <Link to={`/admin/case/${r.id}`} className="block border-[1.5px] border-navy bg-surface p-3 hover:shadow-[3px_3px_0_var(--color-copper)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm font-bold">{r.caseId}</span>
        {!compact && <StatusBadge status={r.status} />}
        <span className="ml-auto rounded-sm bg-slate-200 px-1.5 font-mono text-xs">{SOURCE_LABELS[r.source]}</span>
      </div>
      <p className="mt-1 font-bold">{r.clientInfo.name}<span className="ml-2 font-normal text-ink-muted">{r.clientInfo.district}</span></p>
      <p className="text-sm text-ink-muted">{CATEGORY_LABELS[r.problemReport.category]}・{fmtTime(r.createdAt)}</p>
      {!compact && <p className="mt-1 line-clamp-2 text-sm">{r.problemReport.description}</p>}
    </Link>
  )
}
