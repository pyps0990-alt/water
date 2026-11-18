import { CalendarDays, ClipboardCheck, Search, Wrench } from 'lucide-react'
import { btnAccent } from './ui'

const NAV = [
  { href: '#services', label: '服務項目' },
  { href: '#schedule', label: '檔期' },
  { href: '#book', label: '預約場勘' },
  { href: '#status', label: '進度查詢' },
]

export function Header({ name }: { name: string }) {
  return (
    <header className="sticky top-0 z-30 bg-navy text-white shadow">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2">
        <a href="#top" className="flex min-h-11 items-center gap-2 font-bold">
          <Wrench aria-hidden className="h-6 w-6 text-amber-accent" />
          <span>{name}</span>
        </a>
        <nav aria-label="主要導覽" className="hidden md:block">
          <ul className="flex gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="inline-flex min-h-11 items-center rounded px-3 hover:bg-white/10">{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden md:block"><a href="#book" className={btnAccent}>預約場勘</a></div>
      </div>
    </header>
  )
}

/** One-hand bottom bar on phones, mirroring the LINE rich menu. */
export function MobileActionBar() {
  const items = [
    { href: '#book', label: '預約場勘', Icon: ClipboardCheck },
    { href: '#status', label: '進度查詢', Icon: Search },
    { href: '#schedule', label: '檔期', Icon: CalendarDays },
  ]
  return (
    <nav aria-label="快速操作" className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-300 bg-surface md:hidden">
      <ul className="grid grid-cols-3">
        {items.map(({ href, label, Icon }) => (
          <li key={href}>
            <a href={href} className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-sm font-semibold text-eng-blue">
              <Icon aria-hidden className="h-5 w-5" />
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
