const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' })

/** Today in Asia/Taipei as YYYY-MM-DD. */
export function taipeiToday(now = new Date()): string {
  return fmt.format(now)
}

export function addDays(ymd: string, n: number): string {
  const [y, m, d] = ymd.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + n))
  return t.toISOString().slice(0, 10)
}

/** 0 = Sunday … 6 = Saturday. */
export function weekday(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

/** Monday of the week containing ymd (weeks run Mon–Sun). */
export function weekStart(ymd: string): string {
  return addDays(ymd, -((weekday(ymd) + 6) % 7))
}

export function nextDays(start: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addDays(start, i))
}

const WEEKDAY_ZH = ['日', '一', '二', '三', '四', '五', '六']
export function weekdayZh(ymd: string): string {
  return WEEKDAY_ZH[weekday(ymd)]
}
