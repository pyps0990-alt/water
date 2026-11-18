import { BadgeCheck, Star } from 'lucide-react'
import type { ReviewsCache, SystemSettings } from '../types/models'
import { btnAccent, btnOutlineLight } from '../components/ui'

export function Hero({ settings, reviews }: { settings: SystemSettings; reviews: ReviewsCache | null }) {
  return (
    <section id="top" className="bg-navy pb-12 pt-10 text-white">
      <div className="mx-auto max-w-5xl px-4">
        <p className="font-semibold text-amber-400">基隆・台北｜電力配電・給排水・衛浴燈具・弱電翻修</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight md:text-5xl">先場勘，再報價。<br />看得到現場，才報得出實價。</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-200">
          管線藏在牆裡、材料價格每月浮動，線上試算只會失準。我們到現場看過後，依當期市價出具正式報價單。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#book" className={btnAccent}>預約場勘</a>
          <a href="#schedule" className={btnOutlineLight}>查看近期檔期</a>
        </div>

        <ul className="mt-8 flex flex-wrap gap-3" aria-label="信任標章">
          {reviews && reviews.total > 0 && (
            <li className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
              <Star aria-hidden className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span>Google 評價 <strong>{reviews.rating.toFixed(1)}</strong>（{reviews.total} 則）</span>
            </li>
          )}
          {settings.licenses.map((l) => (
            <li key={l.certId || l.name} className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
              <BadgeCheck aria-hidden className="h-5 w-5 text-emerald-400" />
              <span>{l.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
