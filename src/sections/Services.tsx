import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { Ban, Bath, Cable, Droplets, Zap } from 'lucide-react'
import { CATEGORIES, CATEGORY_LABELS, type Category } from '../types/models'
import { Section } from '../components/ui'

const ICONS = { electrical: Zap, plumbing: Droplets, fixtures: Bath, weak_current: Cable } as const
const CODES: Record<Category, string> = { electrical: 'E-01', plumbing: 'P-02', fixtures: 'F-03', weak_current: 'W-04' }

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
    <Section id="services" no={2} code="SV" title="服務項目" lead="水電常常一起出問題，一個窗口處理到底。">
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
              className={`group flex min-h-16 flex-col items-start justify-center gap-0.5 rounded-sm border-[1.5px] px-3 py-2 text-left font-bold transition-[background-color,color,box-shadow,translate,border-color] duration-300 ease-[var(--ease-out-expo)] ${
                selected ? '-translate-y-0.5 border-navy bg-[linear-gradient(160deg,#1E2B4A,#0F172A)] text-white shadow-[5px_5px_0_var(--color-copper)]' : 'border-slate-400 bg-surface text-ink hover:-translate-y-0.5 hover:border-navy hover:shadow-[3px_3px_0_rgb(15_23_42/0.15)]'
              }`}
            >
              <span className={`flex items-center gap-1.5 font-mono text-xs ${selected ? 'text-busy-dk' : 'text-eng-blue'}`}>
                <Icon aria-hidden className="h-4 w-4 shrink-0" />{CODES[c]}
              </span>
              {CATEGORY_LABELS[c]}
            </button>
          )
        })}
      </div>
      {CATEGORIES.map((c) => (
        <div key={c} role="tabpanel" id={`panel-${c}`} aria-labelledby={`tab-${c}`} hidden={c !== active} tabIndex={0}
          className="sheet swap-in mt-6 p-5">
          <ul className="stagger grid gap-x-6 sm:grid-cols-2">
            {SERVICES[c].map((s, i) => (
              <li key={s} style={{ '--i': i } as CSSProperties} className="flex items-baseline gap-3 border-b border-dashed border-slate-300 py-2.5">
                <span aria-hidden className="font-mono text-xs font-bold text-eng-blue">{CODES[c].slice(0, 1)}{String(i + 1).padStart(2, '0')}</span>{s}
              </li>
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
      <aside aria-labelledby="unaccepted-title" className="overflow-hidden border-[1.5px] border-navy bg-surface">
        <div aria-hidden className="hazard h-3" />
        <div className="p-5">
          <h2 id="unaccepted-title" className="flex items-center gap-2 text-lg font-black text-closed">
            <Ban aria-hidden className="h-5 w-5" /> 未承接項目 <span className="font-mono text-xs font-bold text-ink-muted">OUT OF SCOPE</span>
          </h2>
          <p className="mt-1 text-ink-muted">以下工程不在我們的服務範圍，請另洽專業廠商，避免您白跑一趟：</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {items.map((s) => (
              <li key={s} className="flex items-center gap-2 border-l-4 border-closed bg-red-50 px-3 py-2"><span aria-hidden className="font-mono font-bold text-closed">✕</span>{s}</li>
            ))}
          </ul>
        </div>
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
    <Section id="process" no={3} code="PR" title="服務流程" lead="不做線上估價器，因為看不到牆裡的狀況。">
      <ol className="relative grid gap-4 md:grid-cols-4">
        <span aria-hidden className="absolute bottom-6 left-[22px] top-6 w-1 bg-[linear-gradient(180deg,#38BDF8,#1E40AF)] md:bottom-auto md:left-6 md:right-6 md:top-[22px] md:h-1 md:w-auto md:bg-[linear-gradient(90deg,#38BDF8,#1E40AF)]" />
        {steps.map(([t, d], i) => (
          <li key={t} data-reveal="" style={{ animationDelay: `${i * 80}ms` }} className="relative flex gap-4 md:flex-col md:gap-3">
            <span className="relative z-10 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-eng-blue bg-surface font-mono text-sm font-bold text-eng-blue shadow-[0_0_0_6px_var(--color-canvas),0_8px_20px_-8px_rgb(30_64_175/0.6)]">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <p className="font-black">{t}</p>
              <p className="text-ink-muted">{d}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}
