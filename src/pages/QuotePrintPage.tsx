import { QuoteDocument } from '../print/QuoteDocument'
import { DEFAULT_SETTINGS } from '../hooks/useSiteData'
import { computeTotals } from '../lib/quote'
import { PrintShell } from '../print/PrintShell'
import type { QuoteItem, Quotation } from '../types/models'

/** Sample data for checking layout, watermark and seal alignment. Clearly marked as a sample. */
function demoQuote(rows: number): Quotation {
  const base: Omit<QuoteItem, 'subtotal'>[] = [
    { name: '全室重新配線（含工帶料）', spec: '太平洋 2.0mm／5.5mm 電線', unit: '式', quantity: 1, unitPrice: 48000 },
    { name: '總開關箱更換', spec: '士林電機 NFB 無熔絲開關', unit: '組', quantity: 1, unitPrice: 12500 },
    { name: '冷氣專用迴路', spec: '220V 5.5mm²', unit: '迴', quantity: 3, unitPrice: 3800 },
    { name: '插座面板更換', spec: '國際牌 Glatima', unit: '只', quantity: 18, unitPrice: 450 },
    { name: '浴室給水管更換', spec: '不鏽鋼 304 壓接管', unit: '式', quantity: 1, unitPrice: 16000 },
  ]
  const items = Array.from({ length: rows }, (_, i) => {
    const b = base[i % base.length]
    return { ...b, name: `${b.name}${i >= base.length ? `（區域 ${Math.floor(i / base.length) + 1}）` : ''}`, subtotal: b.quantity * b.unitPrice }
  })
  const t = computeTotals(items, true, 2000)
  return {
    quoteNumber: 'Q-範例-01', issuedDate: '2026-11-18', validDays: 14, items,
    subtotal: t.subtotal, taxIncluded: true, taxAmount: t.taxAmount, discount: t.discount, totalAmount: t.totalAmount,
    paymentTerms: '訂金 40%、配管完成 30%、完工驗收 30%', warrantyMonths: 12,
    customNotes: '實際施工以現場暗管可施作狀況為準。',
  }
}

export default function QuotePrintPage() {
  const rows = Math.min(200, Math.max(1, Number(new URLSearchParams(location.search).get('rows')) || 30))
  return (
    <PrintShell backHref="/" backLabel="回首頁" note={`範例報價單（${rows} 項）・列印時請選 A4、邊界「無」`}>
      <QuoteDocument quote={demoQuote(rows)} client={{ name: '範例客戶', phone: '09xx-xxx-678', address: '基隆市七堵區（範例地址）' }}
        company={DEFAULT_SETTINGS.companyInfo} />
    </PrintShell>
  )
}
