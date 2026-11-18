import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Columns3, List, RefreshCw, Search } from 'lucide-react'
import { CASE_STATUSES, CATEGORY_LABELS, SOURCES, STATUS_LABELS, type CaseStatus, type Source } from '../types/models'
import { inputCls } from '../components/ui'
import { listCases, type CaseRow } from './api'
import { PageTitle, SOURCE_LABELS, STATUS_ICON, STATUS_LED, SkeletonList, StatusBadge, fmtTime } from './shared'

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
      <PageTitle code="01" title="案件">
        <button onClick={load} className="inline-flex min-h-11 items-center gap-1 px-2 font-bold text-eng-blue"><RefreshCw aria-hidden className="h-4 w-4" />重新整理</button>
        <div role="group" aria-label="檢視方式" className="flex overflow-hidden rounded-sm border-[1.5px] border-navy">
          {([['list', '列表', List], ['board', '看板', Columns3]] as const).map(([v, label, Icon]) => (
            <button key={v} aria-pressed={view === v} onClick={() => setView(v)}
              className={`inline-flex min-h-11 items-center gap-1 px-3 font-bold transition-colors ${view === v ? 'bg-navy text-white' : 'bg-surface hover:bg-slate-100'}`}>
              <Icon aria-hidden className="h-4 w-4" />{label}
            </button>
          ))}
        </div>
      </PageTitle>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_12rem]">
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
              className={`inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full border-[1.5px] px-4 font-bold transition-[background-color,color,box-shadow] duration-300 ${status === s ? 'border-navy bg-navy text-white shadow-[3px_3px_0_var(--color-copper)]' : 'border-slate-400 bg-surface hover:border-navy'}`}>
              {s === 'all' ? `全部 ${filtered.length}` : `${STATUS_LABELS[s]} ${counts[s]}`}
            </button>
          ))}
        </div>
      )}

      <div aria-live="polite" className="mt-4">
        {error && <p role="alert" className="font-bold text-closed">讀取失敗：{error}</p>}
        {!rows && !error && <><p role="status" className="sr-only">載入中…</p><SkeletonList /></>}
        {rows && view === 'list' && (
          shown.length ? <ul key={status} className="stagger grid gap-3">{shown.map((r, i) => <li key={r.id} style={{ '--i': Math.min(i, 12) } as CSSProperties}><CaseCard r={r} /></li>)}</ul>
            : <p className="text-ink-muted">沒有符合的案件。</p>
        )}
        {rows && view === 'board' && (
          <div className="grid gap-3 overflow-x-auto pb-2 [grid-template-columns:repeat(6,minmax(12.5rem,1fr))]">
            {CASE_STATUSES.map((s) => {
              const Icon = STATUS_ICON[s]
              const col = filtered.filter((r) => r.status === s)
              return (
                <section key={s} aria-label={`${STATUS_LABELS[s]}（${col.length}）`} className="overflow-hidden rounded-sm border-[1.5px] border-navy bg-slate-100/90">
                  <h2 className="flex items-center gap-2 bg-[linear-gradient(160deg,#1E2B4A,#0F172A)] px-3 py-2 font-black text-white">
                    <span aria-hidden className={`led ${STATUS_LED[s]}`} /><Icon aria-hidden className="h-4 w-4 text-slate-300" />{STATUS_LABELS[s]}
                    <span className="ml-auto rounded-full bg-white/10 px-2 font-mono text-sm">{col.length}</span>
                  </h2>
                  <ul className="stagger grid gap-2 p-2">{col.map((r, i) => <li key={r.id} style={{ '--i': Math.min(i, 8) } as CSSProperties}><CaseCard r={r} compact /></li>)}</ul>
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
    <Link viewTransition to={`/admin/case/${r.id}`} className="block rounded-sm border-[1.5px] border-navy bg-surface p-3 transition-[translate,box-shadow] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-copper)]">
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
