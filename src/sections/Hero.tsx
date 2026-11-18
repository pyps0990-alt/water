import { BadgeCheck, Star } from 'lucide-react'
import type { ReviewsCache, SystemSettings } from '../types/models'
import { btnAccent, btnOutlineLight } from '../components/ui'
import { SingleLineDiagram } from '../components/SingleLineDiagram'

export function Hero({ settings, reviews }: { settings: SystemSettings; reviews: ReviewsCache | null }) {
  return (
    <section id="top" className="bp-grid relative overflow-hidden pb-14 pt-10 text-white">
      <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 md:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-2 border border-copper/60 px-2 py-1 font-mono text-xs font-bold tracking-wider text-busy-dk">
            <span aria-hidden className="h-2 w-2 rounded-full bg-ok-dk" /> KEELUNG · TAIPEI<span className="hidden sm:inline"> ／ 電力・給排水・衛浴燈具・弱電</span>
          </p>
          <h1 className="mt-4 text-4xl font-black leading-[1.15] md:text-6xl">
            先場勘，<br />再報價。
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-200">
            管線藏在牆裡、材料價格每月浮動，線上試算只會失準。<br className="hidden md:inline" />
            我們到現場看過，依當期市價出具正式報價單。
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#book" className={btnAccent}>預約場勘</a>
            <a href="#schedule" className={btnOutlineLight}>查看近期檔期</a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-2" aria-label="信任標章">
            {reviews && reviews.total > 0 && (
              <li className="flex items-center gap-2 border border-white/25 bg-white/5 px-3 py-2">
                <Star aria-hidden className="h-5 w-5 fill-busy-dk text-busy-dk" />
                <span>Google <strong className="font-mono">{reviews.rating.toFixed(1)}</strong>（{reviews.total} 則）</span>
              </li>
            )}
            {settings.licenses.map((l) => (
              <li key={l.certId || l.name} className="flex items-center gap-2 border border-white/25 bg-white/5 px-3 py-2">
                <BadgeCheck aria-hidden className="h-5 w-5 text-ok-dk" />
                <span>{l.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="border border-white/20 bg-navy/60 p-4">
            <SingleLineDiagram />
            <p className="mt-2 flex justify-between border-t border-white/20 pt-2 font-mono text-[0.7rem] text-slate-300">
              <span>SINGLE-LINE DIAGRAM</span><span>SCALE 1:∞</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
