import type { CSSProperties } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useArmUntilVisible } from '../lib/motion'
import { Section } from '../components/ui'
import type { DayView } from '../hooks/useSchedule'
import { weekday, weekdayZh } from '../lib/dates'
import { DAY_STATUS_LABELS, type DayStatus } from '../types/models'

/** Each day is drawn as a breaker: up = available, mid = busy, down = closed. Always with a text label. */
const POS: Record<DayStatus, 'up' | 'mid' | 'down'> = { available: 'up', busy: 'mid', closed: 'down' }
const LED: Record<DayStatus, string> = { available: 'led-ok', busy: 'led-busy', closed: 'led-off' }
const TEXT: Record<DayStatus, string> = { available: 'text-ok-dk', busy: 'text-busy-dk', closed: 'text-closed-dk' }
const SHORT: Record<DayStatus, [string, string]> = { available: ['ON', '可約'], busy: ['TRIP', '繁忙'], closed: ['OFF', '休息'] }

function effective(d: DayView): DayStatus {
  return d.status === 'available' && d.weekFull ? 'busy' : d.status
}

interface Props { maxWeeklyCases: number; notice?: string; days: DayView[]; loading: boolean; thisWeekFull: boolean }

export function ScheduleBoard({ maxWeeklyCases, notice, days, loading, thisWeekFull }: Props) {
  const offset = days.length ? (weekday(days[0].date) + 6) % 7 : 0 // Monday-first grid
  const [panelRef, armed] = useArmUntilVisible<HTMLDivElement>()

  return (
    <Section id="schedule" no={4} code="LC" title="近 30 天檔期" lead={`每週最多承接 ${maxWeeklyCases} 件場勘，額滿後自動順延至下週。`}>
      {(notice || thisWeekFull) && (
        <p role="status" className="mb-4 flex items-start gap-2 border-l-4 border-amber-accent bg-amber-50 p-3 font-bold text-busy">
          <AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
          {notice || '本週場勘已額滿，目前受理下週的場勘預約。'}
        </p>
      )}

      <div ref={panelRef} data-armed={armed && !loading} className="panel p-3 pt-4 sm:p-5" aria-busy={loading}>
        <span aria-hidden className="screw left-2 top-2" /><span aria-hidden className="screw right-2 top-2" />
        <span aria-hidden className="screw bottom-2 left-2" /><span aria-hidden className="screw bottom-2 right-2" />

        <div className="mx-auto mb-4 flex max-w-md items-center justify-between border border-slate-500 bg-slate-200 px-3 py-1 font-mono text-xs font-bold text-navy">
          <span>LOAD CENTER · 30D</span>
          <span>MAX {maxWeeklyCases}/WK</span>
        </div>

        <ul className="mb-3 flex flex-wrap justify-center gap-4 text-sm text-slate-200" aria-label="圖例">
          {(Object.keys(POS) as DayStatus[]).map((s) => (
            <li key={s} className="flex items-center gap-2">
              <span aria-hidden className="breaker-slot scale-75"><span className="breaker-handle" data-pos={POS[s]} /></span>
              <span className={TEXT[s]}>{DAY_STATUS_LABELS[s]}</span>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs font-bold text-slate-300" aria-hidden>
          {['一', '二', '三', '四', '五', '六', '日'].map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <ul className="grid grid-cols-7 gap-1" aria-label="每日檔期">
          {Array.from({ length: offset }, (_, i) => <li key={`pad-${i}`} aria-hidden />)}
          {days.map((d, i) => {
            const s = effective(d)
            const [, m, day] = d.date.split('-').map(Number)
            const label = `${m}月${day}日（${weekdayZh(d.date)}）${DAY_STATUS_LABELS[s]}${d.weekFull && d.status === 'available' ? '，本週已額滿' : ''}${d.note ? `，${d.note}` : ''}`
            return (
              <li key={d.date} aria-label={label} title={d.note} style={{ '--i': i } as CSSProperties}
                className={`relative flex min-h-[4.75rem] flex-col items-center justify-between gap-1 rounded-sm border px-0.5 py-1.5 transition-colors ${i === 0 ? 'border-copper/70 bg-navy-3' : 'border-slate-700 bg-navy-2'}`}>
                <span aria-hidden className={`led ${LED[s]} absolute right-1 top-1 scale-75`} />
                <span aria-hidden className="font-mono text-sm font-bold leading-none text-white">{day === 1 ? `${m}/1` : day}</span>
                <span aria-hidden className="breaker-slot"><span className="breaker-handle" data-pos={POS[s]} /></span>
                <span aria-hidden className={`whitespace-nowrap text-[0.7rem] font-bold leading-none ${TEXT[s]}`}>
                  <span className="hidden font-mono sm:inline">{SHORT[s][0]} </span>{SHORT[s][1]}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </Section>
  )
}
