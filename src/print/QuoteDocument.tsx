import { computeTotals, ntd } from '../lib/quote'
import type { Quotation, SystemSettings } from '../types/models'
import { paginate } from './paginate'
import './print.css'

export interface QuoteClient { name: string; phone: string; address: string }

interface Props { quote: Quotation; client: QuoteClient; company: SystemSettings['companyInfo']; watermarkUrl?: string }

function addDaysIso(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export function QuoteDocument({ quote, client, company, watermarkUrl }: Props) {
  const pages = paginate(quote.items.length)
  const totals = computeTotals(quote.items, quote.taxIncluded, quote.discount)
  const multi = pages.length > 1

  return (
    <div className="a4-stack">
      {pages.map((pg) => (
        <article key={pg.index} className="a4-page" aria-label={`報價單第 ${pg.index + 1} 頁，共 ${pages.length} 頁`}>
          <div className="a4-watermark" aria-hidden>
            {watermarkUrl ? <img src={watermarkUrl} alt="" /> : <span>{company.name}</span>}
          </div>

          {multi && !pg.isLast && (<><div className="seal seal-right" aria-hidden /><div className="seal-label right">騎縫章蓋印處</div></>)}
          {multi && !pg.isFirst && (<><div className="seal seal-left" aria-hidden /><div className="seal-label left">騎縫章蓋印處</div></>)}

          <div className="a4-content">
            {pg.isFirst ? (
              <header className="q-head">
                <div className="q-brand">
                  <div>
                    <h1>{company.name}</h1>
                    <div className="q-muted">統一編號：{company.taxId || '—'}　電話：{company.phone || '—'}</div>
                    <div className="q-muted">{company.address}</div>
                  </div>
                  <div className="q-title">報價單</div>
                </div>
                <div className="q-meta">
                  <div>報價單號：<strong>{quote.quoteNumber}</strong></div>
                  <div>報價日期：{quote.issuedDate}</div>
                  <div>有效期限：{quote.validDays} 天（至 {addDaysIso(quote.issuedDate, quote.validDays)}）</div>
                  <div>稅別：{quote.taxIncluded ? '外加 5% 營業稅' : '未稅'}</div>
                </div>
                <section className="q-box">
                  <h2>客戶資料</h2>
                  <div>客戶：{client.name}　電話：{client.phone}</div>
                  <div>施工地址：{client.address}</div>
                </section>
              </header>
            ) : (
              <header className="q-cont">
                <strong>{company.name}｜報價單 {quote.quoteNumber}（續）</strong>
                <span>客戶：{client.name}</span>
              </header>
            )}

            {pg.rowEnd > pg.rowStart && (
            <table className="q-table">
              <colgroup><col style={{ width: '8mm' }} /><col /><col style={{ width: '36mm' }} /><col style={{ width: '13mm' }} /><col style={{ width: '12mm' }} /><col style={{ width: '22mm' }} /><col style={{ width: '24mm' }} /></colgroup>
              <thead><tr><th>#</th><th>項目</th><th>規格</th><th>單位</th><th className="num">數量</th><th className="num">單價</th><th className="num">小計</th></tr></thead>
              <tbody>
                {quote.items.slice(pg.rowStart, pg.rowEnd).map((it, k) => (
                  <tr key={pg.rowStart + k}>
                    <td>{pg.rowStart + k + 1}</td>
                    <td><span className="clamp2">{it.name}</span></td>
                    <td><span className="clamp2 q-muted">{it.spec}</span></td>
                    <td>{it.unit}</td>
                    <td className="num">{it.quantity}</td>
                    <td className="num">{it.unitPrice.toLocaleString('zh-TW')}</td>
                    <td className="num">{Math.round(it.quantity * it.unitPrice).toLocaleString('zh-TW')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}

            {pg.isLast && (
              <footer className="q-foot">
                <div className="q-totals">
                  <div><span>小計</span><span>{ntd(totals.subtotal)}</span></div>
                  {totals.discount > 0 && <div><span>折讓</span><span>− {ntd(totals.discount)}</span></div>}
                  <div><span>營業稅 5%</span><span>{quote.taxIncluded ? ntd(totals.taxAmount) : '未稅'}</span></div>
                  <div className="grand"><span>總計</span><span>{ntd(totals.totalAmount)}</span></div>
                </div>
                <div className="q-terms">
                  <div><strong>付款條件：</strong>{quote.paymentTerms}</div>
                  <div><strong>保固：</strong>完工驗收後 {quote.warrantyMonths} 個月</div>
                  <div style={{ gridColumn: '1 / -1' }}><strong>匯款帳號：</strong>{company.bankAccount || '—'}</div>
                  {quote.customNotes && <div style={{ gridColumn: '1 / -1' }}><strong>備註：</strong>{quote.customNotes}</div>}
                </div>
                <div className="q-sign">
                  <div>承攬方簽章：{company.name}<br /><span className="q-muted">日期：</span></div>
                  <div>業主簽章：<br /><span className="q-muted">日期：</span></div>
                </div>
              </footer>
            )}
          </div>
          <div className="q-pageno">第 {pg.index + 1} 頁／共 {pages.length} 頁</div>
        </article>
      ))}
    </div>
  )
}
