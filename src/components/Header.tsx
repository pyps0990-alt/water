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
    <header className="glass-nav sticky top-0 z-30 text-white shadow-[0_8px_30px_-12px_rgb(0_0_0/0.6)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2">
        <a href="#top" className="flex min-h-11 items-center gap-2 font-bold">
          <span aria-hidden className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-[image:var(--grad-copper)] shadow-[var(--glow-copper)]"><Wrench className="h-4 w-4 text-navy" /></span>
          <span className="font-black tracking-wide">{name}</span>
        </a>
        <nav aria-label="主要導覽" className="hidden md:block">
          <ul className="flex gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="group relative inline-flex min-h-11 items-center px-3 text-slate-200 transition-colors hover:text-white">
                  {n.label}
                  <span aria-hidden className="absolute inset-x-3 bottom-2 h-0.5 origin-left scale-x-0 bg-[image:var(--grad-copper)] transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden md:block"><a href="#book" className={btnAccent}>預約場勘</a></div>
      </div>
      <div aria-hidden className="copper-rule opacity-80" />
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
    <nav aria-label="快速操作" className="glass-nav fixed inset-x-0 bottom-0 z-30 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div aria-hidden className="copper-rule opacity-80" />
      <ul className="grid grid-cols-3">
        {items.map(({ href, label, Icon }) => (
          <li key={href}>
            <a href={href} className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-sm font-bold text-white active:bg-white/10">
              <Icon aria-hidden className="h-5 w-5 text-copper" />
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
