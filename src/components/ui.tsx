import type { ReactNode } from 'react'

export function Section({ id, title, lead, children, className = '' }: { id: string; title: string; lead?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`scroll-mt-20 py-12 ${className}`}>
      <div className="mx-auto max-w-5xl px-4">
        <h2 id={`${id}-title`} className="text-2xl font-bold text-navy md:text-3xl">{title}</h2>
        {lead && <p className="mt-2 text-ink-muted">{lead}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </section>
  )
}

export const btnPrimary =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-eng-blue px-5 py-2.5 font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50'
export const btnAccent =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-amber-accent px-5 py-2.5 font-semibold text-navy hover:bg-amber-500'
export const btnOutlineLight =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-white px-5 py-2 font-semibold text-white hover:bg-white/10'
export const btnSecondary =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-eng-blue bg-surface px-5 py-2 font-semibold text-eng-blue hover:bg-blue-50'
export const inputCls =
  'mt-1 block min-h-11 w-full rounded-lg border border-slate-400 bg-surface px-3 py-2 text-ink placeholder:text-slate-500 focus:border-eng-blue focus:outline-none focus:ring-2 focus:ring-eng-blue/40 aria-[invalid=true]:border-closed'
