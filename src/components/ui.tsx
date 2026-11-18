import type { ReactNode } from 'react'

/** Section styled as a drawing sheet: §NN · title · DWG code, with a dimension line. */
export function Section({ id, no, code, title, lead, children, className = '' }:
  { id: string; no: number; code: string; title: string; lead?: string; children: ReactNode; className?: string }) {
  const n = String(no).padStart(2, '0')
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`scroll-mt-20 py-14 ${className}`}>
      <div className="mx-auto max-w-5xl px-4">
        <div data-reveal="" className="flex items-baseline gap-3">
          <span aria-hidden className="font-mono text-sm font-bold text-copper">§{n}</span>
          <h2 id={`${id}-title`} className="text-2xl font-black tracking-wide text-navy md:text-3xl">{title}</h2>
          <span aria-hidden className="ml-auto hidden font-mono text-xs text-ink-muted sm:inline">{code}-{n} · REV.A</span>
        </div>
        <div aria-hidden data-reveal="" className="dim-line mt-2" />
        {lead && <p data-reveal="" className="mt-3 max-w-3xl text-ink-muted">{lead}</p>}
        <div data-reveal="" className="mt-7">{children}</div>
      </div>
    </section>
  )
}

export const btnPrimary = 'btn btn-primary btn-sheen'
export const btnAccent = 'btn btn-accent btn-sheen'
export const btnOutlineLight = 'btn btn-ghost-light'
export const btnSecondary = 'btn btn-outline'
export const inputCls =
  'mt-1 block min-h-11 w-full rounded-sm border-[1.5px] border-slate-400 bg-surface px-3 py-2 text-ink shadow-[inset_0_1px_2px_rgb(15_23_42/0.06)] transition-[border-color,box-shadow] duration-200 placeholder:text-slate-500 hover:border-slate-500 focus:border-eng-blue focus:outline-none focus:ring-4 focus:ring-electric/20 aria-[invalid=true]:border-closed'
