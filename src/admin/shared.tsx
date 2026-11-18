import type { ReactNode } from 'react'
import { Banknote, CalendarClock, Calculator, CheckCircle2, ClipboardList, HardHat } from 'lucide-react'
import { STATUS_LABELS, type CaseStatus, type Source } from '../types/models'

export const STATUS_ICON: Record<CaseStatus, typeof CheckCircle2> = {
  arranging: ClipboardList, pending_survey: CalendarClock, quoting: Calculator,
  in_progress: HardHat, unpaid: Banknote, final_paid: CheckCircle2,
}
const STATUS_CLS: Record<CaseStatus, string> = {
  arranging: 'border-slate-500 bg-slate-100 text-ink',
  pending_survey: 'border-eng-blue bg-blue-50 text-eng-blue',
  quoting: 'border-amber-accent bg-amber-50 text-busy',
  in_progress: 'border-navy bg-navy text-white',
  unpaid: 'border-closed bg-red-50 text-closed',
  final_paid: 'border-ok bg-green-50 text-ok',
}

export function StatusBadge({ status }: { status: CaseStatus }) {
  const Icon = STATUS_ICON[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-sm font-bold ${STATUS_CLS[status]}`}>
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

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`sheet p-4 ${className}`}>{children}</div>
}
