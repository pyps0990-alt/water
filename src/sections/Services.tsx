import { useRef, useState, type KeyboardEvent } from 'react'
import { Ban, Bath, Cable, Droplets, Zap } from 'lucide-react'
import { CATEGORIES, CATEGORY_LABELS, type Category } from '../types/models'
import { Section } from '../components/ui'

const ICONS = { electrical: Zap, plumbing: Droplets, fixtures: Bath, weak_current: Cable } as const

const SERVICES: Record<Category, string[]> = {
  electrical: ['老屋全室重新配線', '總開關箱／無熔絲開關更換', '冷氣、烘碗機、IH 爐專用迴路', '110V／220V 迴路配置與平衡', '跳電、漏電、插座燒焦檢修', '台電表後增設電源'],
  plumbing: ['漏水檢測與明管／暗管修繕', '老舊鐵管更換不鏽鋼管', '馬桶、排水管堵塞疏通', '水塔、加壓馬達安裝更換', '熱水器管路配置', '廚房與浴室排水改道'],
  fixtures: ['馬桶、面盆、淋浴設備安裝', '各式燈具、吸頂燈、崁燈安裝', '浴室暖風機、排風扇安裝', '電熱水器、儲熱式熱水器安裝', '廚房水槽與龍頭更換'],
  weak_current: ['網路線、電話線、電視線佈線', '監視器管線預埋', '對講機、門鈴線路', '全室翻修水電統包', '裝修前水電規劃與配管'],
}

export function Services() {
  const [active, setActive] = useState<Category>('electrical')
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  const onKey = (e: KeyboardEvent, i: number) => {
    const n = CATEGORIES.length
    const next = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : -1
    if (next < 0) return
    e.preventDefault()
    setActive(CATEGORIES[next])
    tabs.current[next]?.focus()
  }

  return (
    <Section id="services" title="服務項目" lead="水電常常一起出問題，一個窗口處理到底。">
      <div role="tablist" aria-label="工程類別" className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {CATEGORIES.map((c, i) => {
          const Icon = ICONS[c]
          const selected = c === active
          return (
            <button
              key={c}
              ref={(el) => { tabs.current[i] = el }}
              role="tab"
              id={`tab-${c}`}
              aria-selected={selected}
              aria-controls={`panel-${c}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(c)}
              onKeyDown={(e) => onKey(e, i)}
              className={`flex min-h-14 items-center gap-2 rounded-lg border-2 px-3 py-2 text-left font-semibold ${
                selected ? 'border-eng-blue bg-eng-blue text-white' : 'border-slate-300 bg-surface text-ink hover:border-eng-blue'
              }`}
            >
              <Icon aria-hidden className="h-5 w-5 shrink-0" />
              {CATEGORY_LABELS[c]}
            </button>
          )
        })}
      </div>
      {CATEGORIES.map((c) => (
        <div key={c} role="tabpanel" id={`panel-${c}`} aria-labelledby={`tab-${c}`} hidden={c !== active} tabIndex={0}
          className="mt-4 rounded-xl bg-surface p-5 shadow-sm">
          <ul className="grid gap-2 sm:grid-cols-2">
            {SERVICES[c].map((s) => (
              <li key={s} className="flex gap-2"><span aria-hidden className="text-ok">✔</span>{s}</li>
            ))}
          </ul>
        </div>
      ))}
    </Section>
  )
}

export function Unaccepted({ items }: { items: string[] }) {
  if (!items.length) return null
  return (
    <div className="mx-auto max-w-5xl px-4">
      <aside aria-labelledby="unaccepted-title" className="rounded-xl border-l-4 border-closed bg-red-50 p-5">
        <h2 id="unaccepted-title" className="flex items-center gap-2 text-lg font-bold text-closed">
          <Ban aria-hidden className="h-5 w-5" /> 未承接項目
        </h2>
        <p className="mt-1 text-ink-muted">以下工程不在我們的服務範圍，請另洽專業廠商：</p>
        <ul className="mt-2 list-disc pl-6">
          {items.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </aside>
    </div>
  )
}

export function Process() {
  const steps = [
    ['線上預約', '填寫問題並上傳現場照片'],
    ['到府場勘', '師傅實地檢查管線與配電'],
    ['正式報價', '依當期材料市價出具報價單'],
    ['施工與保固', '簽約施工，完工後享保固'],
  ]
  return (
    <Section id="process" title="服務流程" lead="不做線上估價器，因為看不到牆裡的狀況。">
      <ol className="grid gap-3 md:grid-cols-4">
        {steps.map(([t, d], i) => (
          <li key={t} className="rounded-xl bg-surface p-4 shadow-sm">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy font-bold text-white">{i + 1}</span>
            <p className="mt-2 font-bold">{t}</p>
            <p className="text-ink-muted">{d}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
