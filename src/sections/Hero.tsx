import type { CSSProperties } from 'react'
import { BadgeCheck, Star } from 'lucide-react'
import type { ReviewsCache, SystemSettings } from '../types/models'
import { btnAccent, btnOutlineLight } from '../components/ui'
import { SingleLineDiagram } from '../components/SingleLineDiagram'

const d = (s: number) => ({ '--d': `${s}s` }) as CSSProperties

interface Props { settings: SystemSettings; reviews: ReviewsCache | null; remaining: number | null }

export function Hero({ settings, reviews, remaining }: Props) {
  const full = remaining !== null && remaining <= 0
  return (
    <section id="top" className="bp-night relative overflow-hidden pb-16 pt-12 text-white md:pb-24 md:pt-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 md:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="enter inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1 pl-2 pr-3 font-mono text-xs font-bold tracking-wider text-slate-200 backdrop-blur" style={d(0.05)}>
            <span aria-hidden className={`led ${full ? 'led-busy' : 'led-ok'}`} />
            {remaining === null ? 'KEELUNG · TAIPEI' : full ? '本週已額滿・受理下週場勘' : `本週場勘剩 ${remaining} 個名額`}
          </p>
          <h1 className="mt-5 text-[2.6rem] font-black leading-[1.08] tracking-tight md:text-7xl">
            <span className="line-mask"><span style={d(0.12)}>先場勘，</span></span>
            <span className="line-mask"><span style={d(0.24)} className="bg-[image:var(--grad-copper)] bg-clip-text text-transparent">再報價。</span></span>
          </h1>
          <p className="enter mt-5 max-w-xl text-lg leading-relaxed text-slate-300" style={d(0.42)}>
            管線藏在牆裡、材料價格每月浮動，線上試算只會失準。
            我們到現場看過，依當期市價出具正式報價單。
          </p>
          <div className="enter mt-8 flex flex-wrap gap-3" style={d(0.55)}>
            <a href="#book" className={`${btnAccent} px-6`}>預約場勘</a>
            <a href="#schedule" className={btnOutlineLight}>查看近期檔期</a>
          </div>
          <ul className="enter mt-9 flex flex-wrap gap-2" style={d(0.7)} aria-label="信任標章">
            <li className="flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-sm">
              <span aria-hidden className="font-mono text-busy-dk">⚡</span>電力 × 給排水 一次處理
            </li>
            {reviews && reviews.total > 0 && (
              <li className="flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-sm">
                <Star aria-hidden className="h-4 w-4 fill-busy-dk text-busy-dk" />
                Google <strong className="font-mono">{reviews.rating.toFixed(1)}</strong>（{reviews.total} 則）
              </li>
            )}
            {settings.licenses.map((l) => (
              <li key={l.certId || l.name} className="flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-sm">
                <BadgeCheck aria-hidden className="h-4 w-4 text-ok-dk" />{l.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="enter-frame relative" style={d(0.25)}>
          <div aria-hidden className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(closest-side,rgb(56_189_248/0.16),transparent)]" />
          <div className="rounded-md border border-white/12 bg-[linear-gradient(160deg,rgb(30_43_74/0.85),rgb(11_20_40/0.85))] p-4 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.8),inset_0_1px_0_rgb(255_255_255/0.06)] backdrop-blur">
            <SingleLineDiagram />
          </div>
        </div>
      </div>
      <div aria-hidden className="copper-rule absolute inset-x-0 bottom-0 opacity-70" />
    </section>
  )
}
