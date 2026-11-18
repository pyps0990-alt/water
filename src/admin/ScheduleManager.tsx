import { useEffect, useState } from 'react'
import { btnPrimary, inputCls } from '../components/ui'
import { addDays, nextDays, taipeiToday, weekdayZh } from '../lib/dates'
import { DAY_STATUS_LABELS, type DayStatus, type ScheduleDoc } from '../types/models'
import { getSettings, listSchedule, saveSettings, setDay } from './api'
import { Card } from './shared'

const STATUSES: DayStatus[] = ['available', 'busy', 'closed']
const ON: Record<DayStatus, string> = { available: 'border-ok bg-ok text-white', busy: 'border-busy bg-busy text-white', closed: 'border-closed bg-closed text-white' }

export function ScheduleManager() {
  const today = taipeiToday()
  const days = nextDays(today, 30)
  const [docs, setDocs] = useState<Record<string, ScheduleDoc>>({})
  const [max, setMax] = useState(5)
  const [notice, setNotice] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    listSchedule(today, addDays(today, 29)).then(setDocs).catch((e) => setMsg(e.message))
    getSettings().then((s) => { setMax(s.maxWeeklyCases ?? 5); setNotice(s.publicNotice ?? '') })
  }, [today])

  async function update(date: string, dayStatus: DayStatus, note: string) {
    const prev = docs[date]
    setDocs({ ...docs, [date]: { date, bookedCount: prev?.bookedCount ?? 0, dayStatus, note } })
    try { await setDay(date, dayStatus, note); setMsg('') } catch (e) { setDocs({ ...docs }); setMsg(`儲存失敗：${(e as Error).message}`) }
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-black">檔期與產能</h1>
      <Card>
        <div className="grid gap-3 sm:grid-cols-[12rem_1fr_auto] sm:items-end">
          <label className="block font-bold">每週場勘上限
            <div className="mt-1 flex items-center gap-2">
              <button className="h-11 w-11 border-[1.5px] border-navy text-xl font-bold" onClick={() => setMax(Math.max(1, max - 1))} aria-label="減少一件">−</button>
              <input type="number" min={1} max={50} inputMode="numeric" className={`${inputCls} mt-0 w-20 text-center font-mono`} value={max} onChange={(e) => setMax(Number(e.target.value) || 1)} />
              <button className="h-11 w-11 border-[1.5px] border-navy text-xl font-bold" onClick={() => setMax(max + 1)} aria-label="增加一件">＋</button>
            </div>
          </label>
          <label className="block font-bold">公告（顯示在檔期表上方，可留空）
            <input className={inputCls} value={notice} onChange={(e) => setNotice(e.target.value)} placeholder="例：本週已滿，受理下週場勘" />
          </label>
          <button className={btnPrimary} onClick={() => saveSettings({ maxWeeklyCases: max, publicNotice: notice }).then(() => setMsg('已儲存產能設定')).catch((e) => setMsg(e.message))}>儲存</button>
        </div>
      </Card>
      <p aria-live="polite" className="font-bold">{msg}</p>
      <ul className="grid gap-2 md:grid-cols-2">
        {days.map((d) => {
          const doc = docs[d]
          const status = doc?.dayStatus ?? 'available'
          const [, m, day] = d.split('-').map(Number)
          return (
            <li key={d} className="border-[1.5px] border-slate-400 bg-surface p-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-24 font-mono font-bold">{m}/{day}（{weekdayZh(d)}）</span>
                <span className="font-mono text-xs text-ink-muted">已約 {doc?.bookedCount ?? 0}</span>
                <div role="radiogroup" aria-label={`${m}月${day}日狀態`} className="ml-auto flex gap-1">
                  {STATUSES.map((s) => (
                    <button key={s} role="radio" aria-checked={status === s} onClick={() => update(d, s, doc?.note ?? '')}
                      className={`min-h-11 rounded-sm border-[1.5px] px-2.5 text-sm font-bold ${status === s ? ON[s] : 'border-slate-400 bg-surface'}`}>
                      {DAY_STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
              <label className="mt-1 block">
                <span className="sr-only">{m}月{day}日備註</span>
                <input className={`${inputCls} mt-0 min-h-10 text-sm`} placeholder="備註（公開顯示，例：上午可場勘）" defaultValue={doc?.note ?? ''}
                  onBlur={(e) => e.target.value !== (doc?.note ?? '') && update(d, status, e.target.value)} />
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
