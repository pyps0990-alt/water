import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore/lite'
import { getDb, isFirebaseConfigured } from '../lib/firebase'
import { addDays, nextDays, taipeiToday, weekStart } from '../lib/dates'
import type { DayStatus, ScheduleDoc } from '../types/models'

export interface DayView {
  date: string
  status: DayStatus
  note?: string
  weekFull: boolean
}

export const SCHEDULE_DAYS = 30

export function useSchedule(maxWeeklyCases: number) {
  const today = taipeiToday()
  const [docs, setDocs] = useState<Record<string, ScheduleDoc>>({})
  const [loading, setLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    if (!isFirebaseConfigured) return
    // Include the start of the current week so this week's bookings count toward the cap.
    const from = weekStart(today)
    const to = addDays(today, SCHEDULE_DAYS - 1)
    getDocs(query(collection(getDb(), 'schedules'), where('date', '>=', from), where('date', '<=', to)))
      .then((snap) => {
        const map: Record<string, ScheduleDoc> = {}
        snap.forEach((d) => { map[d.id] = d.data() as ScheduleDoc })
        setDocs(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [today])

  const days = useMemo<DayView[]>(() => {
    const weekTotals: Record<string, number> = {}
    for (const d of Object.values(docs)) {
      const w = weekStart(d.date)
      weekTotals[w] = (weekTotals[w] ?? 0) + (d.bookedCount ?? 0)
    }
    return nextDays(today, SCHEDULE_DAYS).map((date) => {
      const d = docs[date]
      const weekFull = (weekTotals[weekStart(date)] ?? 0) >= maxWeeklyCases
      return { date, status: d?.dayStatus ?? 'available', note: d?.note, weekFull }
    })
  }, [docs, today, maxWeeklyCases])

  const thisWeekFull = days[0]?.weekFull ?? false
  return { days, loading, thisWeekFull, today }
}
