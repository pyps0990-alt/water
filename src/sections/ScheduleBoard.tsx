import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Section } from '../components/ui'
import type { DayView } from '../hooks/useSchedule'
import { weekday, weekdayZh } from '../lib/dates'
import { DAY_STATUS_LABELS, type DayStatus } from '../types/models'

const STYLE: Record<DayStatus, { cls: string; Icon: typeof CheckCircle2 }> = {
  available: { cls: 'border-ok bg-green-50 text-ok', Icon: CheckCircle2 },
  busy: { cls: 'border-busy bg-amber-50 text-busy', Icon: Clock },
  closed: { cls: 'border-closed bg-red-50 text-closed', Icon: XCircle },
}

function effective(d: DayView): DayStatus {
  return d.status === 'available' && d.weekFull ? 'busy' : d.status
}

interface Props { maxWeeklyCases: number; notice?: string; days: DayView[]; loading: boolean; thisWeekFull: boolean }

export function ScheduleBoard({ maxWeeklyCases, notice, days, loading, thisWeekFull }: Props) {
  const offset = days.length ? (weekday(days[0].date) + 6) % 7 : 0 // Monday-first grid

  return (
    <Section id="schedule" title="近 30 天檔期" lead={`每週最多承接 ${maxWeeklyCases} 件場勘，額滿後自動順延至下週。`}>
      {(notice || thisWeekFull) && (
        <p role="status" className="mb-4 flex items-start gap-2 rounded-lg border-l-4 border-amber-accent bg-amber-50 p-3 font-semibold text-busy">
          <AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
          {notice || '本週場勘已額滿，目前受理下週的場勘預約。'}
        </p>
      )}

      <ul className="mb-4 flex flex-wrap gap-4 text-sm" aria-label="圖例">
        {(Object.keys(STYLE) as DayStatus[]).map((s) => {
          const { Icon, cls } = STYLE[s]
          return (
            <li key={s} className="flex items-center gap-1">
              <span className={`inline-flex rounded border p-0.5 ${cls}`}><Icon aria-hidden className="h-4 w-4" /></span>
              {DAY_STATUS_LABELS[s]}
            </li>
          )
        })}
      </ul>

      <div className="rounded-xl bg-surface p-3 shadow-sm" aria-busy={loading}>
        <div className="grid grid-cols-7 gap-1 text-center text-sm font-semibold text-ink-muted" aria-hidden>
          {['一', '二', '三', '四', '五', '六', '日'].map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <ul className="grid grid-cols-7 gap-1" aria-label="每日檔期">
          {Array.from({ length: offset }, (_, i) => <li key={`pad-${i}`} aria-hidden />)}
          {days.map((d) => {
            const s = effective(d)
            const { cls, Icon } = STYLE[s]
            const [, m, day] = d.date.split('-').map(Number)
            const label = `${m}月${day}日（${weekdayZh(d.date)}）${DAY_STATUS_LABELS[s]}${d.weekFull && d.status === 'available' ? '，本週已額滿' : ''}${d.note ? `，${d.note}` : ''}`
            return (
              <li key={d.date} aria-label={label} title={d.note}
                className={`flex min-h-14 flex-col items-center justify-center rounded-md border px-0.5 py-1 ${cls}`}>
                <span aria-hidden className="text-base font-bold leading-none">{day === 1 ? `${m}/1` : day}</span>
                <Icon aria-hidden className="mt-1 h-4 w-4" />
                <span aria-hidden className="text-[0.7rem] leading-tight sm:text-xs">{DAY_STATUS_LABELS[s]}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </Section>
  )
}
