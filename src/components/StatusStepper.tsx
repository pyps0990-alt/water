import { Banknote, CalendarClock, Calculator, CheckCircle2, ClipboardList, HardHat } from 'lucide-react'
import { CASE_STATUSES, STATUS_LABELS, type CaseStatus } from '../types/models'

const ICONS: Record<CaseStatus, typeof CheckCircle2> = {
  arranging: ClipboardList, pending_survey: CalendarClock, quoting: Calculator,
  in_progress: HardHat, unpaid: Banknote, final_paid: CheckCircle2,
}

/** Six terminals on a wire. State = text + icon + color (never color alone). */
export function StatusStepper({ status }: { status: CaseStatus }) {
  const current = CASE_STATUSES.indexOf(status)
  const pct = (current / (CASE_STATUSES.length - 1)) * 100
  return (
    <div className="relative">
      {/* wire: grey track with the energized (copper) part up to the current terminal */}
      <span aria-hidden className="absolute bottom-5 left-[20px] top-5 w-1 bg-slate-300 sm:hidden">
        <span className="block w-full bg-copper" style={{ height: `${pct}%` }} />
      </span>
      <span aria-hidden className="absolute left-[8.33%] right-[8.33%] top-[20px] hidden h-1 bg-slate-300 sm:block">
        <span className="block h-full bg-copper" style={{ width: `${pct}%` }} />
      </span>
      <ol className="relative grid gap-3 sm:grid-cols-6 sm:gap-1" aria-label="案件進度">
        {CASE_STATUSES.map((s, i) => {
          const Icon = ICONS[s]
          const state = i < current ? 'done' : i === current ? 'current' : 'todo'
          const node = state === 'done' ? 'border-ok bg-ok text-white' : state === 'current' ? 'pulse-ring border-copper bg-navy text-busy-dk' : 'border-slate-300 bg-surface text-slate-500'
          const tag = state === 'done' ? '已完成' : state === 'current' ? '目前階段' : '尚未開始'
          return (
            <li key={s} aria-current={state === 'current' ? 'step' : undefined} className="flex items-center gap-3 sm:flex-col sm:gap-1 sm:text-center">
              <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] ${node}`}>
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <span>
                <span className={`block font-bold ${state === 'todo' ? 'text-ink-muted' : 'text-ink'}`}>{STATUS_LABELS[s]}</span>
                <span className={`block font-mono text-xs ${state === 'current' ? 'font-bold text-busy' : 'text-ink-muted'}`}>{String(i + 1).padStart(2, '0')} · {tag}</span>
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
