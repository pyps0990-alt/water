import type { ReactNode } from 'react'
import { Banknote, CalendarClock, Calculator, CheckCircle2, ClipboardList, HardHat } from 'lucide-react'
import { STATUS_LABELS, type CaseStatus, type Source } from '../types/models'

export const STATUS_ICON: Record<CaseStatus, typeof CheckCircle2> = {
  arranging: ClipboardList, pending_survey: CalendarClock, quoting: Calculator,
  in_progress: HardHat, unpaid: Banknote, final_paid: CheckCircle2,
}
const STATUS_CLS: Record<CaseStatus, string> = {
  arranging: 'border-slate-400 bg-slate-100 text-ink',
  pending_survey: 'border-eng-blue/60 bg-blue-50 text-eng-blue',
  quoting: 'border-amber-accent/70 bg-amber-50 text-busy',
  in_progress: 'border-navy bg-[linear-gradient(160deg,#1E2B4A,#0F172A)] text-white',
  unpaid: 'border-closed/60 bg-red-50 text-closed',
  final_paid: 'border-ok/60 bg-green-50 text-ok',
}
export const STATUS_LED: Record<CaseStatus, string> = {
  arranging: 'bg-slate-400', pending_survey: 'bg-electric', quoting: 'led-busy', in_progress: 'bg-cyan',
  unpaid: 'led-off', final_paid: 'led-ok',
}

export function StatusBadge({ status }: { status: CaseStatus }) {
  const Icon = STATUS_ICON[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm font-bold ${STATUS_CLS[status]}`}>
      <Icon aria-hidden className="h-4 w-4" />{STATUS_LABELS[status]}
    </span>
  )
}

export const SOURCE_LABELS: Record<Source, string> = {
  google_business: 'Google', line: 'LINE', ig: 'IG', fb: 'FB', threads: 'Threads', direct: '直接',
}

export function fmtTime(t?: { toDate?: () => Date } | null): string {
  const d = t?.toDate?.()
  return d ? d.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
}

/** Admin page heading in the same drawing-sheet language as the public site. */
export function PageTitle({ code, title, children }: { code: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="swap-in">
      <div className="flex flex-wrap items-baseline gap-3">
        <span aria-hidden className="font-mono text-sm font-bold text-copper">§{code}</span>
        <h1 className="text-2xl font-black tracking-wide text-navy md:text-3xl">{title}</h1>
        <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>
      </div>
      <div aria-hidden className="dim-line mt-2" />
    </div>
  )
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <ul aria-hidden className="grid gap-3">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="border-[1.5px] border-slate-200 bg-surface p-3">
          <div className="skeleton h-4 w-40" /><div className="skeleton mt-2 h-4 w-24" /><div className="skeleton mt-2 h-3 w-full" />
        </li>
      ))}
    </ul>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`sheet p-4 ${className}`}>{children}</div>
}
