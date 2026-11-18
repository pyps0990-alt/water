import { useEffect, useState, type ReactNode } from 'react'
import { ArrowLeft, Printer } from 'lucide-react'
import { btnAccent, btnOutlineLight } from '../components/ui'

/** Screen toolbar + fit-to-width preview around an A4 document. Toolbar is hidden when printing. */
export function PrintShell({ backHref, backLabel, note, children }: { backHref: string; backLabel: string; note?: string; children: ReactNode }) {
  const [zoom, setZoom] = useState(1)
  useEffect(() => {
    const fit = () => setZoom(Math.min(1, (window.innerWidth - 16) / 794)) // 210mm ≈ 794px
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  return (
    <div className="min-h-screen bg-slate-300">
      <div className="no-print sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b-2 border-copper bg-navy p-3 text-white">
        <a href={backHref} className={btnOutlineLight}><ArrowLeft aria-hidden className="h-4 w-4" />{backLabel}</a>
        <button type="button" onClick={() => window.print()} className={btnAccent}><Printer aria-hidden className="h-4 w-4" />列印／存成 PDF</button>
        <span className="text-sm text-slate-300">{note ?? '列印時請選 A4、邊界「無」、勾選「背景圖形」'}</span>
      </div>
      <div style={{ zoom }}>{children}</div>
    </div>
  )
}
