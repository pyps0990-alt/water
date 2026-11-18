import { Banknote, CalendarClock, Calculator, CheckCircle2, ClipboardList, HardHat } from 'lucide-react'
import { CASE_STATUSES, STATUS_LABELS, type CaseStatus } from '../types/models'

const ICONS: Record<CaseStatus, typeof CheckCircle2> = {
  arranging: ClipboardList, pending_survey: CalendarClock, quoting: Calculator,
  in_progress: HardHat, unpaid: Banknote, final_paid: CheckCircle2,
}

/** Six-stage progress; state is shown by text + icon + color, never color alone. */
export function StatusStepper({ status }: { status: CaseStatus }) {
  const current = CASE_STATUSES.indexOf(status)
  return (
    <ol className="grid gap-2 sm:grid-cols-6" aria-label="案件進度">
      {CASE_STATUSES.map((s, i) => {
        const Icon = ICONS[s]
        const state = i < current ? 'done' : i === current ? 'current' : 'todo'
        const cls = state === 'done' ? 'border-ok bg-green-50 text-ok' : state === 'current' ? 'border-eng-blue bg-eng-blue text-white' : 'border-slate-300 bg-surface text-ink-muted'
        const tag = state === 'done' ? '已完成' : state === 'current' ? '目前階段' : '尚未開始'
        return (
          <li key={s} aria-current={state === 'current' ? 'step' : undefined}
            className={`flex items-center gap-2 rounded-lg border-2 p-2 sm:flex-col sm:text-center ${cls}`}>
            <Icon aria-hidden className="h-5 w-5 shrink-0" />
            <span className="font-semibold">{i + 1}. {STATUS_LABELS[s]}</span>
            <span className="ml-auto text-xs sm:ml-0">{tag}</span>
          </li>
        )
      })}
    </ol>
  )
}
