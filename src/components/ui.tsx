import type { ReactNode } from 'react'

/** Section styled as a drawing sheet: §NN · title · DWG code, with a dimension line. */
export function Section({ id, no, code, title, lead, children, className = '' }:
  { id: string; no: number; code: string; title: string; lead?: string; children: ReactNode; className?: string }) {
  const n = String(no).padStart(2, '0')
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`scroll-mt-20 py-14 ${className}`}>
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-baseline gap-3">
          <span aria-hidden className="font-mono text-sm font-bold text-copper">§{n}</span>
          <h2 id={`${id}-title`} className="text-2xl font-black tracking-wide text-navy md:text-3xl">{title}</h2>
          <span aria-hidden className="ml-auto hidden font-mono text-xs text-ink-muted sm:inline">{code}-{n} · REV.A</span>
        </div>
        <div aria-hidden className="dim-line mt-2" />
        {lead && <p className="mt-3 max-w-3xl text-ink-muted">{lead}</p>}
        <div className="mt-7">{children}</div>
      </div>
    </section>
  )
}

export const btnPrimary =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-eng-blue px-5 py-2.5 font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50'
export const btnAccent =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-amber-accent px-5 py-2.5 font-semibold text-navy hover:bg-amber-500'
export const btnOutlineLight =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border-2 border-white px-5 py-2 font-semibold text-white hover:bg-white/10'
export const btnSecondary =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border-2 border-eng-blue bg-surface px-5 py-2 font-semibold text-eng-blue hover:bg-blue-50'
export const inputCls =
  'mt-1 block min-h-11 w-full rounded-sm border-[1.5px] border-slate-500 bg-surface px-3 py-2 text-ink placeholder:text-slate-500 focus:border-eng-blue focus:outline-none focus:ring-2 focus:ring-eng-blue/40 aria-[invalid=true]:border-closed'
